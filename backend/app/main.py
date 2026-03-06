import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import FastAPI, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.database import get_db, engine, Base
from app.models import Alert
from app.oref_client import fetch_history, CATEGORY_MAP
from app.shelter_times import get_shelter_time, SHELTER_TIMES
from app.city_coords import resolve_coords
from app.poller import poll_loop, REDIS_CHANNEL

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist (fallback — init.sql is primary)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Start background poller
    poller_task = asyncio.create_task(poll_loop())
    logger.info("Red Alert Dashboard backend started")

    yield

    poller_task.cancel()
    try:
        await poller_task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Red Alert Dashboard", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── SSE Stream ───────────────────────────────────────────────

async def _alert_generator() -> AsyncGenerator[dict, None]:
    """Subscribe to Redis and yield alerts as SSE events."""
    redis = aioredis.from_url(settings.redis_url)
    pubsub = redis.pubsub()
    await pubsub.subscribe(REDIS_CHANNEL)

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                if isinstance(data, bytes):
                    data = data.decode("utf-8")
                yield {"event": "alert", "data": data}
    finally:
        await pubsub.unsubscribe(REDIS_CHANNEL)
        await redis.aclose()


@app.get("/api/alerts/stream")
async def alert_stream():
    """SSE endpoint — real-time alert stream."""
    return EventSourceResponse(_alert_generator())


# ─── REST Endpoints ───────────────────────────────────────────

@app.get("/api/alerts/live")
async def get_live_alerts():
    """Return the most recent alert (last 60 seconds)."""
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=60)
    async with engine.begin() as conn:
        result = await conn.execute(
            select(Alert).where(Alert.alerted_at >= cutoff).order_by(Alert.alerted_at.desc())
        )
        rows = result.fetchall()

    return [
        {
            "id": r.oref_id,
            "category": r.category,
            "category_desc": r.category_desc,
            "title": r.title,
            "description": r.description,
            "cities": r.cities,
            "alerted_at": r.alerted_at.isoformat(),
        }
        for r in rows
    ]


@app.get("/api/alerts/history")
async def get_alert_history(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    category: int | None = Query(None),
    hours: int = Query(24, ge=1, le=720),
    city: str | None = Query(None, description="Search by city/place name (Hebrew)"),
):
    """Paginated alert history from the database."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    offset = (page - 1) * limit

    async with engine.begin() as conn:
        query = select(Alert).where(Alert.alerted_at >= cutoff)
        count_query = select(func.count(Alert.id)).where(Alert.alerted_at >= cutoff)

        if category is not None:
            query = query.where(Alert.category == category)
            count_query = count_query.where(Alert.category == category)

        if city:
            city_filter = Alert.cities.any(city)
            query = query.where(city_filter)
            count_query = count_query.where(city_filter)

        query = query.order_by(Alert.alerted_at.desc()).offset(offset).limit(limit)

        rows = (await conn.execute(query)).fetchall()
        total = (await conn.execute(count_query)).scalar()

    return {
        "success": True,
        "data": [
            {
                "id": r.oref_id,
                "category": r.category,
                "category_desc": r.category_desc,
                "title": r.title,
                "cities": r.cities,
                "alerted_at": r.alerted_at.isoformat(),
            }
            for r in rows
        ],
        "metadata": {"total": total, "page": page, "limit": limit},
    }


@app.get("/api/alerts/cities")
async def get_cities(q: str = Query("", description="Search prefix")):
    """Return distinct city names, optionally filtered by prefix."""
    async with engine.begin() as conn:
        result = await conn.execute(
            text("""
                SELECT DISTINCT city FROM alerts, unnest(cities) AS city
                WHERE city ILIKE :pattern
                ORDER BY city
                LIMIT 50
            """),
            {"pattern": f"%{q}%" if q else "%"},
        )
        return [r.city for r in result.fetchall()]


@app.get("/api/alerts/stats")
async def get_alert_stats(days: int = Query(7, ge=1, le=90)):
    """Aggregated alert statistics."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    async with engine.begin() as conn:
        # Alerts per day
        daily = (
            await conn.execute(
                text("""
                    SELECT DATE(alerted_at) AS day, category, COUNT(*) AS count
                    FROM alerts
                    WHERE alerted_at >= :cutoff
                    GROUP BY DATE(alerted_at), category
                    ORDER BY day DESC
                """),
                {"cutoff": cutoff},
            )
        ).fetchall()

        # Top cities
        top_cities = (
            await conn.execute(
                text("""
                    SELECT city, COUNT(*) as count
                    FROM alerts, unnest(cities) AS city
                    WHERE alerted_at >= :cutoff
                    GROUP BY city
                    ORDER BY count DESC
                    LIMIT 20
                """),
                {"cutoff": cutoff},
            )
        ).fetchall()

        # Total count
        total = (
            await conn.execute(
                text("SELECT COUNT(*) FROM alerts WHERE alerted_at >= :cutoff"),
                {"cutoff": cutoff},
            )
        ).scalar()

    return {
        "success": True,
        "data": {
            "total_alerts": total,
            "daily": [
                {"day": str(r.day), "category": r.category, "count": r.count}
                for r in daily
            ],
            "top_cities": [
                {"city": r.city, "count": r.count} for r in top_cities
            ],
            "categories": CATEGORY_MAP,
        },
    }


@app.get("/api/shelter-time")
async def get_shelter_times(city: str | None = Query(None)):
    """Get shelter time for a city or all known shelter times."""
    if city:
        coords = resolve_coords(city)
        lat = coords[0] if coords else None
        seconds = get_shelter_time(city, lat)
        return {
            "city": city,
            "shelter_seconds": seconds,
            "coords": coords,
        }
    return SHELTER_TIMES


@app.get("/api/network-info")
async def network_info(request: Request):
    """Return the LAN IP if detectable (fallback for frontend WebRTC detection)."""
    import os
    lan_ip = os.environ.get("HOST_LAN_IP", "")
    if not lan_ip:
        # Try Host header (works when accessed via LAN IP directly)
        host = request.headers.get("host", "localhost").split(":")[0]
        if host not in ("localhost", "127.0.0.1"):
            lan_ip = host
    return {"lan_ip": lan_ip or "localhost"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}
