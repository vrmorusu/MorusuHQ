from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/family", tags=["family"])


@router.get("/members", response_model=list[schemas.FamilyMemberRead])
def list_members(db: Session = Depends(get_db)) -> list[models.FamilyMember]:
    return crud.list_all(db, models.FamilyMember, order_by=models.FamilyMember.sort_order)


@router.post("/members", response_model=schemas.FamilyMemberRead, status_code=201)
def create_member(
    payload: schemas.FamilyMemberCreate, db: Session = Depends(get_db)
) -> models.FamilyMember:
    return crud.create(db, models.FamilyMember, payload.model_dump())


@router.patch("/members/{member_id}", response_model=schemas.FamilyMemberRead)
def update_member(
    member_id: int, payload: schemas.FamilyMemberUpdate, db: Session = Depends(get_db)
) -> models.FamilyMember:
    return crud.update(db, models.FamilyMember, member_id, payload.model_dump(exclude_unset=True))


@router.delete("/members/{member_id}", status_code=204)
def delete_member(member_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.FamilyMember, member_id)
