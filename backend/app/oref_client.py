import json
import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

OREF_HEADERS = {
    "Host": "www.oref.org.il",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    "charset": "utf-8",
    "X-Requested-With": "XMLHttpRequest",
    "sec-ch-ua-mobile": "?0",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "sec-ch-ua-platform": '"Windows"',
    "Accept": "*/*",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    "Referer": "https://www.oref.org.il/12481-he/Pakar.aspx",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
}

CATEGORY_MAP = {
    1: "ירי רקטות וטילים",
    2: "אירוע רדיולוגי",
    3: "רעידת אדמה",
    4: "צונאמי",
    5: "חדירת כלי טיס עוין",
    6: "חומרים מסוכנים",
    7: "חדירת מחבלים",
    10: "התרעה מוקדמת",
    13: "עדכון מיוחד",
    14: "התרעה מוקדמת",
}


def _strip_bom(text: str) -> str:
    return text.lstrip("\ufeff").strip()


async def fetch_active_alerts() -> dict | None:
    """Fetch currently active alerts from Oref. Returns parsed dict or None."""
    async with httpx.AsyncClient(verify=True, timeout=10) as client:
        try:
            resp = await client.get(settings.oref_alerts_url, headers=OREF_HEADERS)
            resp.raise_for_status()
            body = _strip_bom(resp.text)
            if not body:
                return None
            data = json.loads(body)
            if not isinstance(data, dict) or "data" not in data:
                logger.warning("Oref API unexpected format: %s", type(data))
                return None
            return data
        except httpx.HTTPStatusError as e:
            logger.warning("Oref API HTTP error: %s", e.response.status_code)
            return None
        except (json.JSONDecodeError, httpx.RequestError) as e:
            logger.warning("Oref API error: %s", e)
            return None


async def fetch_history() -> list[dict]:
    """Fetch last 24h alert history from Oref. Tries multiple endpoints."""
    endpoints = [
        settings.oref_history_url,
        "https://www.oref.org.il/Shared/Ajax/GetAlarmsHistory.aspx?lang=he&fromDate=&toDate=&mode=0",
    ]

    async with httpx.AsyncClient(verify=True, timeout=15, follow_redirects=True) as client:
        # First visit the main page to get cookies
        try:
            await client.get("https://www.oref.org.il/12481-he/Pakar.aspx", headers=OREF_HEADERS)
        except Exception as e:
            logger.debug("Cookie pre-fetch failed: %s", e)

        for url in endpoints:
            try:
                resp = await client.get(url, headers=OREF_HEADERS)
                resp.raise_for_status()
                body = _strip_bom(resp.text)
                if not body:
                    continue
                data = json.loads(body)
                if isinstance(data, list) and len(data) > 0:
                    logger.info("History fetched from %s (%d items)", url, len(data))
                    return data
            except (json.JSONDecodeError, httpx.HTTPStatusError, httpx.RequestError) as e:
                logger.warning("Oref history (%s) error: %s", url, e)
                continue

    return []


DEMO_ALERTS = [
    {
        "id": "demo-001",
        "cat": "1",
        "title": "ירי רקטות וטילים",
        "desc": "היכנסו למרחב המוגן תוך 90 שניות",
        "data": ["תל אביב - מרכז העיר", "רמת גן", "גבעתיים"],
    },
    {
        "id": "demo-002",
        "cat": "1",
        "title": "ירי רקטות וטילים",
        "desc": "היכנסו למרחב המוגן תוך 15 שניות",
        "data": ["שדרות", "איבים", "ניר עם"],
    },
    {
        "id": "demo-003",
        "cat": "5",
        "title": "חדירת כלי טיס עוין",
        "desc": "היכנסו למרחב המוגן",
        "data": ["חיפה - כרמל ועיר תחתית", "קריית אתא"],
    },
]

import asyncio
import random

_demo_index = 0
_demo_lock = asyncio.Lock()


async def fetch_demo_alert() -> dict | None:
    """Cycle through demo alerts for testing without Oref access."""
    global _demo_index

    # Return an alert ~30% of the time to simulate real patterns
    if random.random() > 0.3:
        return None

    async with _demo_lock:
        alert = DEMO_ALERTS[_demo_index % len(DEMO_ALERTS)].copy()
        alert["id"] = f"demo-{datetime.now(timezone.utc).timestamp():.0f}"
        _demo_index += 1
    return alert
