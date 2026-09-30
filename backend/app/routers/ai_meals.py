from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models
from app.database import get_db

router = APIRouter(prefix="/api/ai-meals", tags=["ai-meal-intelligence"])


@router.get("/suggestions")
def get_meal_suggestions(db: Session = Depends(get_db)) -> dict:
    """Suggest recipes whose ingredients best match what's currently in the pantry."""
    pantry_items = crud.list_all(db, models.PantryItem)
    recipes = crud.list_all(db, models.Recipe)

    pantry_names = {item.name.strip().lower() for item in pantry_items if not item.low_stock}

    suggestions = []
    for recipe in recipes:
        ingredient_lines = [
            line.strip().lower() for line in recipe.ingredients.splitlines() if line.strip()
        ]
        if not ingredient_lines:
            continue
        matched = [
            line for line in ingredient_lines if any(name in line for name in pantry_names)
        ]
        match_ratio = len(matched) / len(ingredient_lines)
        if matched:
            suggestions.append(
                {
                    "recipe_id": recipe.id,
                    "title": recipe.title,
                    "match_ratio": round(match_ratio, 2),
                    "matched_ingredients": matched,
                    "missing_ingredients": [l for l in ingredient_lines if l not in matched],
                }
            )

    suggestions.sort(key=lambda s: s["match_ratio"], reverse=True)
    return {
        "pantry_item_count": len(pantry_items),
        "recipe_count": len(recipes),
        "suggestions": suggestions[:10],
    }
