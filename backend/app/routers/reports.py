from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models
from app.database import get_db

router = APIRouter(prefix="/api/reports", tags=["monthly-reports"])


@router.get("/summary")
def get_monthly_summary(db: Session = Depends(get_db)) -> dict:
    today = date.today()

    chores = crud.list_all(db, models.Chore)
    chores_done = [c for c in chores if c.done]

    grocery = crud.list_all(db, models.GroceryItem)
    grocery_bought = [g for g in grocery if g.purchased]

    finance = [e for e in crud.list_all(db, models.FinanceEntry) if e.date.month == today.month and e.date.year == today.year]
    income = sum(e.amount for e in finance if e.entry_type == "income")
    expense = sum(e.amount for e in finance if e.entry_type == "expense")

    notes = crud.list_all(db, models.Note)

    events = [e for e in crud.list_all(db, models.Event) if e.start_time.month == today.month and e.start_time.year == today.year]

    progress = crud.list_all(db, models.ProgressEntry)
    progress_by_module: dict[str, int] = {}
    for entry in progress:
        if entry.date.month == today.month and entry.date.year == today.year:
            progress_by_module[entry.module] = progress_by_module.get(entry.module, 0) + 1

    return {
        "period": today.strftime("%B %Y"),
        "chores_completed": len(chores_done),
        "chores_total": len(chores),
        "grocery_purchased": len(grocery_bought),
        "grocery_total": len(grocery),
        "finance_income": income,
        "finance_expense": expense,
        "finance_balance": income - expense,
        "notes_total": len(notes),
        "events_this_month": len(events),
        "progress_entries_by_module": progress_by_module,
    }
