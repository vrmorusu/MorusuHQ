from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models
from app.database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)) -> dict:
    chores = crud.list_all(db, models.Chore)
    pending_chores = [c for c in chores if not c.done]

    grocery = [g for g in crud.list_all(db, models.GroceryItem) if not g.purchased]

    pantry_low = [p for p in crud.list_all(db, models.PantryItem) if p.low_stock]

    upcoming_events = [
        e for e in crud.list_all(db, models.Event, order_by=models.Event.start_time)
        if e.start_time >= datetime.now()
    ][:5]

    finance_entries = [
        e for e in crud.list_all(db, models.FinanceEntry)
        if e.date.month == date.today().month and e.date.year == date.today().year
    ]
    income = sum(e.amount for e in finance_entries if e.entry_type == "income")
    expense = sum(e.amount for e in finance_entries if e.entry_type == "expense")

    notes = crud.list_all(db, models.Note, order_by=models.Note.id.desc())

    return {
        "chores_pending": len(pending_chores),
        "grocery_to_buy": len(grocery),
        "pantry_low_stock": len(pantry_low),
        "upcoming_events": [
            {"title": e.title, "start_time": e.start_time.isoformat()} for e in upcoming_events
        ],
        "finance_balance_this_month": income - expense,
        "latest_note": notes[0].title if notes else None,
        "notes_count": len(notes),
    }
