from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/grocery", tags=["grocery"])


@router.get("/items", response_model=list[schemas.GroceryItemRead])
def list_grocery_items(db: Session = Depends(get_db)) -> list[models.GroceryItem]:
    return crud.list_all(db, models.GroceryItem, order_by=models.GroceryItem.name)


@router.post("/items", response_model=schemas.GroceryItemRead, status_code=201)
def create_grocery_item(
    payload: schemas.GroceryItemCreate, db: Session = Depends(get_db)
) -> models.GroceryItem:
    return crud.create(db, models.GroceryItem, payload.model_dump())


@router.patch("/items/{item_id}", response_model=schemas.GroceryItemRead)
def update_grocery_item(
    item_id: int, payload: schemas.GroceryItemUpdate, db: Session = Depends(get_db)
) -> models.GroceryItem:
    return crud.update(db, models.GroceryItem, item_id, payload.model_dump(exclude_unset=True))


@router.delete("/items/{item_id}", status_code=204)
def delete_grocery_item(item_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.GroceryItem, item_id)
