from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/ai-assistant", tags=["ai-assistant"])


def _answer(message: str, db: Session) -> str:
    text = message.lower()

    if "chore" in text:
        chores = crud.list_all(db, models.Chore)
        pending = [c for c in chores if not c.done]
        if not pending:
            return "All chores are done. Nothing pending right now."
        names = ", ".join(c.title for c in pending[:5])
        return f"There {'is' if len(pending) == 1 else 'are'} {len(pending)} pending chore(s): {names}."

    if "grocery" in text or "shopping" in text:
        items = [i for i in crud.list_all(db, models.GroceryItem) if not i.purchased]
        if not items:
            return "The grocery list is empty right now."
        names = ", ".join(i.name for i in items[:8])
        return f"You still need to buy: {names}."

    if "pantry" in text or "fridge" in text:
        low = [i for i in crud.list_all(db, models.PantryItem) if i.low_stock]
        if not low:
            return "Pantry looks well stocked, nothing is flagged as low."
        names = ", ".join(i.name for i in low[:8])
        return f"Running low on: {names}."

    if "event" in text or "calendar" in text or "schedule" in text:
        upcoming = [
            e for e in crud.list_all(db, models.Event, order_by=models.Event.start_time)
            if e.start_time >= datetime.now()
        ]
        if not upcoming:
            return "No upcoming events on the calendar."
        next_event = upcoming[0]
        return f"Next up: \"{next_event.title}\" on {next_event.start_time:%b %d at %I:%M %p}."

    if "budget" in text or "finance" in text or "money" in text or "spend" in text:
        entries = crud.list_all(db, models.FinanceEntry)
        this_month = [e for e in entries if e.date.month == date.today().month]
        expense = sum(e.amount for e in this_month if e.entry_type == "expense")
        income = sum(e.amount for e in this_month if e.entry_type == "income")
        return f"This month: ${income:.2f} income, ${expense:.2f} expenses, balance ${income - expense:.2f}."

    if "note" in text:
        notes = crud.list_all(db, models.Note)
        pinned = [n for n in notes if n.pinned]
        if not notes:
            return "There are no family notes yet."
        if pinned:
            return f"Pinned note: \"{pinned[0].title}\". There are {len(notes)} notes in total."
        return f"There are {len(notes)} family notes. Most recent: \"{notes[0].title}\"."

    if "health" in text or "doctor" in text or "appointment" in text:
        upcoming = [
            r for r in crud.list_all(db, models.HealthRecord, order_by=models.HealthRecord.date)
            if r.date >= date.today() and r.record_type == "appointment"
        ]
        if not upcoming:
            return "No upcoming health appointments."
        r = upcoming[0]
        return f"Next appointment: {r.family_member} — {r.description} on {r.date:%b %d}."

    return (
        "I can help with chores, grocery, pantry, calendar, budget, notes, or health. "
        "Try asking e.g. \"what chores are pending?\""
    )


@router.post("/chat", response_model=schemas.ChatResponse)
def chat(payload: schemas.ChatRequest, db: Session = Depends(get_db)) -> dict:
    return {"reply": _answer(payload.message, db)}


@router.get("/status")
def get_assistant_status() -> dict:
    """Family AI assistant."""
    return {"module": "ai-assistant", "status": "ready"}
