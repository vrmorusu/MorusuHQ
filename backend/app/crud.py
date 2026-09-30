from typing import TypeVar

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

ModelT = TypeVar("ModelT")


def list_all(db: Session, model: type[ModelT], order_by=None, **filters) -> list[ModelT]:
    stmt = select(model)
    for key, value in filters.items():
        stmt = stmt.where(getattr(model, key) == value)
    if order_by is not None:
        stmt = stmt.order_by(order_by)
    return list(db.scalars(stmt).all())


def get_or_404(db: Session, model: type[ModelT], item_id: int) -> ModelT:
    obj = db.get(model, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} {item_id} not found")
    return obj


def create(db: Session, model: type[ModelT], data: dict) -> ModelT:
    obj = model(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, model: type[ModelT], item_id: int, data: dict) -> ModelT:
    obj = get_or_404(db, model, item_id)
    for key, value in data.items():
        if value is not None:
            setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, model: type[ModelT], item_id: int) -> None:
    obj = get_or_404(db, model, item_id)
    db.delete(obj)
    db.commit()
