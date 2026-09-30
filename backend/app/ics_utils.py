import re
import time
import urllib.request
from datetime import datetime

_CACHE: dict[str, tuple[float, list[dict]]] = {}
_CACHE_TTL_SECONDS = 6 * 60 * 60


def _unfold(text: str) -> str:
    """Un-fold RFC 5545 wrapped lines (continuation lines start with a space/tab)."""
    return re.sub(r"\r?\n[ \t]", "", text)


def _parse_ics_datetime(value: str) -> tuple[str, bool]:
    value = value.strip()
    if len(value) == 8:
        d = datetime.strptime(value, "%Y%m%d").date()
        return d.isoformat(), True
    value = value.rstrip("Z")
    dt = datetime.strptime(value[:15], "%Y%m%dT%H%M%S")
    return dt.isoformat(), False


def fetch_ics_events(url: str) -> list[dict]:
    """Fetch and parse a public .ics feed into a list of {title, start, all_day}, cached for 6h."""
    now = time.time()
    cached = _CACHE.get(url)
    if cached and now - cached[0] < _CACHE_TTL_SECONDS:
        return cached[1]

    req = urllib.request.Request(url, headers={"User-Agent": "MorusuHQ/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw = resp.read().decode("utf-8", errors="ignore")

    text = _unfold(raw)
    events = []
    for block in text.split("BEGIN:VEVENT")[1:]:
        block = block.split("END:VEVENT")[0]
        summary_match = re.search(r"SUMMARY:(.*)", block)
        dtstart_match = re.search(r"DTSTART[^:]*:(\S+)", block)
        if not summary_match or not dtstart_match:
            continue
        start_iso, all_day = _parse_ics_datetime(dtstart_match.group(1))
        events.append({"title": summary_match.group(1).strip(), "start": start_iso, "all_day": all_day})

    events.sort(key=lambda e: e["start"])
    _CACHE[url] = (now, events)
    return events
