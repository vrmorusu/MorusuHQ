from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("/", response_model=list[schemas.NoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[models.Note]:
    return crud.list_all(db, models.Note, order_by=models.Note.id.desc())


@router.post("/", response_model=schemas.NoteRead, status_code=201)
def create_note(payload: schemas.NoteCreate, db: Session = Depends(get_db)) -> models.Note:
    return crud.create(db, models.Note, payload.model_dump())


@router.patch("/{note_id}", response_model=schemas.NoteRead)
def update_note(
    note_id: int, payload: schemas.NoteUpdate, db: Session = Depends(get_db)
) -> models.Note:
    return crud.update(db, models.Note, note_id, payload.model_dump(exclude_unset=True))


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.Note, note_id)
