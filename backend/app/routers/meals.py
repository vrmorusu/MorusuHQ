from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app import nutrislice_utils

router = APIRouter(prefix="/api/meals", tags=["meals"])


@router.get("/recipes", response_model=list[schemas.RecipeRead])
def list_recipes(db: Session = Depends(get_db)) -> list[models.Recipe]:
    return crud.list_all(db, models.Recipe, order_by=models.Recipe.title)


@router.post("/recipes", response_model=schemas.RecipeRead, status_code=201)
def create_recipe(payload: schemas.RecipeCreate, db: Session = Depends(get_db)) -> models.Recipe:
    return crud.create(db, models.Recipe, payload.model_dump())


@router.patch("/recipes/{recipe_id}", response_model=schemas.RecipeRead)
def update_recipe(
    recipe_id: int, payload: schemas.RecipeUpdate, db: Session = Depends(get_db)
) -> models.Recipe:
    return crud.update(db, models.Recipe, recipe_id, payload.model_dump(exclude_unset=True))


@router.delete("/recipes/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.Recipe, recipe_id)


@router.get("/school-menu")
def get_school_menu(school: str) -> dict:
    """school is 'elementary' or 'high_school'. Live weekly breakfast/lunch menu from Argyle ISD's Nutrislice feed."""
    info = nutrislice_utils.SCHOOLS.get(school)
    if not info:
        return {"error": "unknown school"}
    return {
        "name": info["name"],
        "breakfast": {
            "price": info["breakfast_price"],
            "days": nutrislice_utils.get_week_menu(info["school_slug"], info["breakfast_menu_type"]),
        },
        "lunch": {
            "price": info["lunch_price"],
            "days": nutrislice_utils.get_week_menu(info["school_slug"], info["lunch_menu_type"]),
        },
    }

