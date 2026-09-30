import datetime as dt

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, ics_utils, models, panchang, schemas
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

ARGYLE_ISD_DISTRICT_CALENDAR_ICS = "https://www.argyleisd.com/fs/calendar-manager/events.ics?calendar_ids=8"


def _sync_recurring_events(db: Session) -> None:
    """Materializes upcoming occurrences (60-day lookahead) for recurring root events."""
    horizon = dt.datetime.now() + dt.timedelta(days=60)
    events = crud.list_all(db, models.Event)
    roots = [e for e in events if e.recurring and e.recurring_parent_id is None and e.interval_days]
    changed = False
    for root in roots:
        chain = [e for e in events if e.recurring_parent_id == root.id] + [root]
        latest = max(chain, key=lambda e: e.start_time)
        next_time = latest.start_time
        while next_time + dt.timedelta(days=root.interval_days) <= horizon:
            next_time = next_time + dt.timedelta(days=root.interval_days)
            db.add(
                models.Event(
                    title=root.title,
                    description=root.description,
                    start_time=next_time,
                    location=root.location,
                    event_type=root.event_type,
                    recurring=True,
                    interval_days=root.interval_days,
                    recurring_parent_id=root.id,
                )
            )
            changed = True
    if changed:
        db.commit()


@router.get("/events", response_model=list[schemas.EventRead])
def list_events(db: Session = Depends(get_db)) -> list[models.Event]:
    _sync_recurring_events(db)
    return crud.list_all(db, models.Event, order_by=models.Event.start_time)


@router.get("/events/day/{day}", response_model=list[schemas.EventRead])
def list_events_for_day(day: str, db: Session = Depends(get_db)) -> list[models.Event]:
    """day is an ISO date string (YYYY-MM-DD); returns that day's events/reminders."""
    _sync_recurring_events(db)
    target = dt.date.fromisoformat(day)
    events = crud.list_all(db, models.Event, order_by=models.Event.start_time)
    return [e for e in events if e.start_time.date() == target]


@router.post("/events", response_model=schemas.EventRead, status_code=201)
def create_event(payload: schemas.EventCreate, db: Session = Depends(get_db)) -> models.Event:
    return crud.create(db, models.Event, payload.model_dump())


@router.patch("/events/{event_id}", response_model=schemas.EventRead)
def update_event(
    event_id: int, payload: schemas.EventUpdate, db: Session = Depends(get_db)
) -> models.Event:
    return crud.update(db, models.Event, event_id, payload.model_dump(exclude_unset=True))


@router.get("/school-events")
def get_school_events() -> dict:
    """Live feed of Argyle ISD district calendar events (holidays, breaks, campus events)."""
    try:
        events = ics_utils.fetch_ics_events(ARGYLE_ISD_DISTRICT_CALENDAR_ICS)
    except Exception:
        events = []
    return {"source": "Argyle ISD", "events": events}


@router.get("/panchang")
def get_panchang(date: str | None = None) -> dict:
    """Approximate Hindu lunar calendar (tithi/paksha) for the given date, default today."""
    target = dt.date.fromisoformat(date) if date else dt.date.today()
    return panchang.compute_tithi(target)


@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.Event, event_id)


@router.get("/google/status")
def google_sync_status() -> dict:
    """Google Calendar sync requires a real OAuth client (Google Cloud Console project).

    No credentials are configured in this environment, so this always reports
    disconnected — surfaced honestly in the UI rather than faking a connection.
    """
    configured = bool(settings.google_client_id and settings.google_client_secret)
    return {
        "configured": configured,
        "connected": False,
        "message": (
            "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (from a Google Cloud OAuth "
            "client) in the backend .env to enable this."
            if not configured
            else "Credentials configured, but the OAuth connect flow isn't wired up yet."
        ),
    }

