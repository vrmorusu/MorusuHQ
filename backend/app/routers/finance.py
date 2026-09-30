from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/finance", tags=["finance"])


def _sync_recurring(db: Session) -> None:
    """Materialize due occurrences of active recurring rules into finance_entries."""
    today = date.today()
    rules = crud.list_all(db, models.RecurringTransaction)
    for rule in rules:
        if not rule.active:
            continue
        horizon = today + timedelta(days=60) if rule.is_bill else today
        next_date = rule.next_date
        changed = False
        while next_date <= horizon:
            db.add(
                models.FinanceEntry(
                    description=rule.description,
                    amount=rule.amount,
                    category=rule.category,
                    entry_type=rule.entry_type,
                    date=next_date,
                    is_bill=rule.is_bill,
                    recurring_id=rule.id,
                )
            )
            next_date = next_date + timedelta(days=rule.interval_days)
            changed = True
        if changed:
            rule.next_date = next_date
    if rules:
        db.commit()


@router.get("/entries", response_model=list[schemas.FinanceEntryRead])
def list_entries(db: Session = Depends(get_db)) -> list[models.FinanceEntry]:
    _sync_recurring(db)
    return crud.list_all(db, models.FinanceEntry, order_by=models.FinanceEntry.date.desc())


@router.post("/entries", response_model=schemas.FinanceEntryRead, status_code=201)
def create_entry(
    payload: schemas.FinanceEntryCreate, db: Session = Depends(get_db)
) -> models.FinanceEntry:
    return crud.create(db, models.FinanceEntry, payload.model_dump())


@router.patch("/entries/{entry_id}", response_model=schemas.FinanceEntryRead)
def update_entry(
    entry_id: int, payload: schemas.FinanceEntryUpdate, db: Session = Depends(get_db)
) -> models.FinanceEntry:
    return crud.update(db, models.FinanceEntry, entry_id, payload.model_dump(exclude_unset=True))


@router.delete("/entries/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.FinanceEntry, entry_id)


@router.get("/recurring", response_model=list[schemas.RecurringTransactionRead])
def list_recurring(db: Session = Depends(get_db)) -> list[models.RecurringTransaction]:
    _sync_recurring(db)
    return crud.list_all(db, models.RecurringTransaction, order_by=models.RecurringTransaction.next_date.asc())


@router.post("/recurring", response_model=schemas.RecurringTransactionRead, status_code=201)
def create_recurring(
    payload: schemas.RecurringTransactionCreate, db: Session = Depends(get_db)
) -> models.RecurringTransaction:
    data = payload.model_dump()
    data["next_date"] = data["start_date"]
    rule = crud.create(db, models.RecurringTransaction, data)
    _sync_recurring(db)
    db.refresh(rule)
    return rule


@router.patch("/recurring/{rule_id}", response_model=schemas.RecurringTransactionRead)
def update_recurring(
    rule_id: int, payload: schemas.RecurringTransactionUpdate, db: Session = Depends(get_db)
) -> models.RecurringTransaction:
    return crud.update(db, models.RecurringTransaction, rule_id, payload.model_dump(exclude_unset=True))


@router.delete("/recurring/{rule_id}", status_code=204)
def delete_recurring(rule_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.RecurringTransaction, rule_id)


@router.get("/summary")
def get_finance_summary(db: Session = Depends(get_db)) -> dict:
    entries = crud.list_all(db, models.FinanceEntry)
    month_entries = [e for e in entries if e.date.month == date.today().month and e.date.year == date.today().year]
    income = sum(e.amount for e in month_entries if e.entry_type == "income")
    expense = sum(e.amount for e in month_entries if e.entry_type == "expense")
    return {
        "month_income": income,
        "month_expense": expense,
        "month_balance": income - expense,
        "total_entries": len(entries),
    }
