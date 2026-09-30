from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/pantry", tags=["pantry"])


@router.get("/items", response_model=list[schemas.PantryItemRead])
def list_pantry_items(db: Session = Depends(get_db)) -> list[models.PantryItem]:
    return crud.list_all(db, models.PantryItem, order_by=models.PantryItem.name)


@router.post("/items", response_model=schemas.PantryItemRead, status_code=201)
def create_pantry_item(
    payload: schemas.PantryItemCreate, db: Session = Depends(get_db)
) -> models.PantryItem:
    return crud.create(db, models.PantryItem, payload.model_dump())


@router.patch("/items/{item_id}", response_model=schemas.PantryItemRead)
def update_pantry_item(
    item_id: int, payload: schemas.PantryItemUpdate, db: Session = Depends(get_db)
) -> models.PantryItem:
    return crud.update(db, models.PantryItem, item_id, payload.model_dump(exclude_unset=True))


@router.delete("/items/{item_id}", status_code=204)
def delete_pantry_item(item_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.PantryItem, item_id)


@router.post("/analyze-photo")
def analyze_photo(payload: dict) -> dict:
    """Would auto-detect pantry items from a photo via a vision AI model.

    No vision AI provider (e.g. OpenAI GPT-4 Vision, Google Cloud Vision) is
    configured in this app, so this honestly reports that instead of
    fabricating detected items. Wire a real API key into this endpoint to
    enable it.
    """
    return {
        "available": False,
        "detected_items": [],
        "message": (
            "Photo item detection needs a vision AI API key (e.g. OpenAI or Google "
            "Cloud Vision) that isn't configured in this app. Add items manually below "
            "for now."
        ),
    }
