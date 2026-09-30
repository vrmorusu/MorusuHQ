import math
from datetime import date, datetime, timedelta, timezone

SYNODIC_MONTH_DAYS = 29.530588861
_REFERENCE_NEW_MOON = datetime(2000, 1, 6, 18, 14, tzinfo=timezone.utc)

TITHI_NAMES = [
    "Pratipada",
    "Dwitiya",
    "Tritiya",
    "Chaturthi",
    "Panchami",
    "Shashthi",
    "Saptami",
    "Ashtami",
    "Navami",
    "Dashami",
    "Ekadashi",
    "Dwadashi",
    "Trayodashi",
    "Chaturdashi",
]


def compute_tithi(target_date: date) -> dict:
    """Approximate tithi/paksha via lunar age (no ephemeris lookup, ~within a day of true Panchang)."""
    noon_utc = datetime.combine(target_date, datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=12)
    days_since_new_moon = (noon_utc - _REFERENCE_NEW_MOON).total_seconds() / 86400
    moon_age = days_since_new_moon % SYNODIC_MONTH_DAYS

    tithi_index = int(moon_age / (SYNODIC_MONTH_DAYS / 30))  # 0-29
    tithi_number = (tithi_index % 15) + 1  # 1-15
    paksha = "Shukla" if tithi_index < 15 else "Krishna"

    if tithi_number == 15:
        name = "Purnima" if paksha == "Shukla" else "Amavasya"
    else:
        name = TITHI_NAMES[tithi_number - 1]

    illumination = round(50 * (1 - math.cos(2 * math.pi * moon_age / SYNODIC_MONTH_DAYS)), 1)

    return {
        "date": target_date.isoformat(),
        "tithi_number": tithi_number,
        "tithi_name": name,
        "paksha": paksha,
        "moon_age_days": round(moon_age, 2),
        "illumination_percent": illumination,
    }
