"""Fetches school breakfast/lunch menus from Argyle ISD's public Nutrislice API.

Discovered API host (not the public-facing argyleisd.nutrislice.com site, which
only serves the SPA shell): https://argyleisd.api.nutrislice.com
"""

import json
import time
import urllib.request
from datetime import date

_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = 6 * 60 * 60

API_HOST = "https://argyleisd.api.nutrislice.com"

SCHOOLS = {
    "elementary": {
        "name": "Jane Ruestmann Elementary",
        "school_slug": "jane-ruestmann-elementary",
        "breakfast_menu_type": "breakfast",
        "lunch_menu_type": "elem-lunch",
        "breakfast_price": 2.45,
        "lunch_price": 4.15,
    },
    "high_school": {
        "name": "Argyle High School",
        "school_slug": "argyle-high-school",
        "breakfast_menu_type": "hs-breakfast",
        "lunch_menu_type": "hs-lunch",
        "breakfast_price": 2.70,
        "lunch_price": 5.15,
    },
}


def _fetch_week(school_slug: str, menu_type: str, target: date) -> dict:
    cache_key = f"{school_slug}:{menu_type}:{target.isoformat()}"
    now = time.time()
    cached = _CACHE.get(cache_key)
    if cached and now - cached[0] < _CACHE_TTL_SECONDS:
        return cached[1]

    url = (
        f"{API_HOST}/menu/api/weeks/school/{school_slug}/menu-type/{menu_type}/"
        f"{target.year}/{target.month:02d}/{target.day:02d}/"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "MorusuHQ/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    _CACHE[cache_key] = (now, data)
    return data


def get_week_menu(school_slug: str, menu_type: str) -> list[dict]:
    """Returns this week's [{date, items: [food names]}] for a school+menu-type, skipping empty days."""
    try:
        raw = _fetch_week(school_slug, menu_type, date.today())
    except Exception:
        return []

    days = []
    for day in raw.get("days", []):
        items = [
            mi["food"]["name"]
            for mi in day.get("menu_items", [])
            if mi.get("food") and mi["food"].get("name")
        ]
        if items:
            days.append({"date": day["date"], "items": items})
    return days
