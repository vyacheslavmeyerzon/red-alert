import asyncio
import json
import logging
from datetime import datetime, timezone

import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.config import settings
from app.database import async_session
from app.models import Alert
from app.city_coords import compute_centroid
from app.oref_client import (
    CATEGORY_MAP,
    fetch_active_alerts,
    fetch_demo_alert,
    fetch_history,
)

logger = logging.getLogger(__name__)

REDIS_CHANNEL = "alerts:live"


async def _store_alert(alert_data: dict) -> bool:
    """Store alert in DB. Returns True if it was new (not duplicate)."""
    oref_id = str(alert_data.get("id", ""))
    if not oref_id:
        return False

    cat = int(alert_data.get("cat", 1))
    cities = alert_data.get("data", [])
    now = datetime.now(timezone.utc)
    centroid = compute_centroid(cities)

    values = dict(
        oref_id=oref_id,
        category=cat,
        category_desc=CATEGORY_MAP.get(cat, str(cat)),
        title=alert_data.get("title"),
        description=alert_data.get("desc"),
        cities=cities,
        raw_json=alert_data,
        alerted_at=now,
    )
    if centroid:
        values["centroid_lat"] = centroid[0]
        values["centroid_lon"] = centroid[1]
        values["centroid"] = f"SRID=4326;POINT({centroid[1]} {centroid[0]})"

    async with async_session() as session:
        stmt = (
            pg_insert(Alert)
            .values(**values)
            .on_conflict_do_nothing(index_elements=["oref_id"])
        )
        result = await session.execute(stmt)
        await session.commit()
        return result.rowcount > 0


async def _store_history_alert(item: dict) -> bool:
    """Store a single history alert item from the Oref history endpoint."""
    oref_id = f"hist-{item.get('alertDate', '')}-{hash(item.get('data', ''))}"
    cat = int(item.get("category", 1))
    cities = [c.strip() for c in item.get("data", "").split(",") if c.strip()]
    title = item.get("title") or item.get("category_desc", "")

    # Parse the alertDate field (formats: "2026-03-05 20:51:14" or ISO)
    alert_date_str = item.get("alertDate", "")
    try:
        alerted_at = datetime.fromisoformat(alert_date_str.replace(" ", "T"))
        if alerted_at.tzinfo is None:
            from zoneinfo import ZoneInfo
            alerted_at = alerted_at.replace(tzinfo=ZoneInfo("Asia/Jerusalem"))
    except (ValueError, TypeError):
        alerted_at = datetime.now(timezone.utc)

    centroid = compute_centroid(cities)
    values = dict(
        oref_id=oref_id,
        category=cat,
        category_desc=CATEGORY_MAP.get(cat, title),
        title=title,
        description=None,
        cities=cities,
        raw_json=item,
        alerted_at=alerted_at,
    )
    if centroid:
        values["centroid_lat"] = centroid[0]
        values["centroid_lon"] = centroid[1]
        values["centroid"] = f"SRID=4326;POINT({centroid[1]} {centroid[0]})"

    async with async_session() as session:
        stmt = (
            pg_insert(Alert)
            .values(**values)
            .on_conflict_do_nothing(index_elements=["oref_id"])
        )
        result = await session.execute(stmt)
        await session.commit()
        return result.rowcount > 0


async def import_history():
    """Import last 24h history from Oref on startup."""
    logger.info("Importing Oref 24h alert history...")
    try:
        history = await fetch_history()
        imported = 0
        for item in history:
            if await _store_history_alert(item):
                imported += 1
        logger.info("History import done: %d new alerts from %d total", imported, len(history))
    except Exception:
        logger.exception("History import failed")


async def poll_loop():
    """Main polling loop — runs as a background task."""
    interval = settings.poll_interval_ms / 1000.0
    redis = aioredis.from_url(settings.redis_url)

    # Import history on first start
    await import_history()

    logger.info(
        "Poller started (interval=%.1fs, demo_mode=%s)", interval, settings.demo_mode
    )

    while True:
        try:
            if settings.demo_mode:
                alert_data = await fetch_demo_alert()
            else:
                alert_data = await fetch_active_alerts()

            if alert_data:
                is_new = await _store_alert(alert_data)
                if is_new:
                    payload = json.dumps(alert_data, ensure_ascii=False)
                    await redis.publish(REDIS_CHANNEL, payload)
                    cities = ", ".join(alert_data.get("data", []))
                    logger.info("New alert: [%s] %s", alert_data.get("title"), cities)

        except Exception:
            logger.exception("Poller error")

        await asyncio.sleep(interval)
