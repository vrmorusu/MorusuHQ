from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

MODULE = "school"
router = APIRouter(prefix="/api/school", tags=["school"])


@router.get("/", response_model=list[schemas.ProgressEntryRead])
def list_entries(db: Session = Depends(get_db)) -> list[models.ProgressEntry]:
    return crud.list_all(db, models.ProgressEntry, order_by=models.ProgressEntry.date.desc(), module=MODULE)


@router.post("/", response_model=schemas.ProgressEntryRead, status_code=201)
def create_entry(payload: schemas.ProgressEntryCreate, db: Session = Depends(get_db)) -> models.ProgressEntry:
    return crud.create(db, models.ProgressEntry, {**payload.model_dump(), "module": MODULE})


@router.patch("/{entry_id}", response_model=schemas.ProgressEntryRead)
def update_entry(
    entry_id: int, payload: schemas.ProgressEntryUpdate, db: Session = Depends(get_db)
) -> models.ProgressEntry:
    return crud.update(db, models.ProgressEntry, entry_id, payload.model_dump(exclude_unset=True))


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.ProgressEntry, entry_id)
