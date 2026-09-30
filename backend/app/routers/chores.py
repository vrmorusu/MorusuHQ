from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/chores", tags=["chores"])


@router.get("/", response_model=list[schemas.ChoreRead])
def list_chores(db: Session = Depends(get_db)) -> list[models.Chore]:
    return crud.list_all(db, models.Chore, order_by=models.Chore.due_date)


@router.post("/", response_model=schemas.ChoreRead, status_code=201)
def create_chore(payload: schemas.ChoreCreate, db: Session = Depends(get_db)) -> models.Chore:
    return crud.create(db, models.Chore, payload.model_dump())


@router.patch("/{chore_id}", response_model=schemas.ChoreRead)
def update_chore(
    chore_id: int, payload: schemas.ChoreUpdate, db: Session = Depends(get_db)
) -> models.Chore:
    was_done = crud.get_or_404(db, models.Chore, chore_id).done
    chore = crud.update(db, models.Chore, chore_id, payload.model_dump(exclude_unset=True))
    if chore.done and not was_done and chore.recurring:
        next_due = (chore.due_date or date.today()) + timedelta(days=chore.interval_days or 7)
        crud.create(
            db,
            models.Chore,
            {
                "title": chore.title,
                "assignee": chore.assignee,
                "points": chore.points,
                "done": False,
                "due_date": next_due,
                "recurring": True,
                "interval_days": chore.interval_days or 7,
            },
        )
    return chore


@router.delete("/{chore_id}", status_code=204)
def delete_chore(chore_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.Chore, chore_id)


@router.get("/summary")
def chores_summary(db: Session = Depends(get_db)) -> dict:
    chores = crud.list_all(db, models.Chore)
    pending = [c for c in chores if not c.done]
    overdue = [c for c in pending if c.due_date and c.due_date < date.today()]
    return {
        "total": len(chores),
        "pending": len(pending),
        "done": len(chores) - len(pending),
        "overdue": len(overdue),
    }


@router.get("/templates", response_model=list[schemas.ChoreTemplateRead])
def list_templates(db: Session = Depends(get_db)) -> list[models.ChoreTemplate]:
    return crud.list_all(db, models.ChoreTemplate, order_by=models.ChoreTemplate.age_band)


@router.post("/templates", response_model=schemas.ChoreTemplateRead, status_code=201)
def create_template(
    payload: schemas.ChoreTemplateCreate, db: Session = Depends(get_db)
) -> models.ChoreTemplate:
    return crud.create(db, models.ChoreTemplate, payload.model_dump())


@router.patch("/templates/{template_id}", response_model=schemas.ChoreTemplateRead)
def update_template(
    template_id: int, payload: schemas.ChoreTemplateUpdate, db: Session = Depends(get_db)
) -> models.ChoreTemplate:
    return crud.update(db, models.ChoreTemplate, template_id, payload.model_dump(exclude_unset=True))


@router.delete("/templates/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.ChoreTemplate, template_id)


@router.post("/apply-template", response_model=list[schemas.ChoreRead], status_code=201)
def apply_template(payload: schemas.ApplyTemplateRequest, db: Session = Depends(get_db)) -> list[models.Chore]:
    templates = crud.list_all(db, models.ChoreTemplate, age_band=payload.age_band)
    created = []
    for t in templates:
        created.append(
            crud.create(
                db,
                models.Chore,
                {
                    "title": t.title,
                    "assignee": payload.assignee,
                    "points": t.points,
                    "done": False,
                    "due_date": date.today(),
                    "recurring": t.recurring,
                    "interval_days": t.interval_days,
                },
            )
        )
    return created

