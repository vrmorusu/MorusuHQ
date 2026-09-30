import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/health-tracking", tags=["health"])


@router.get("/records", response_model=list[schemas.HealthRecordRead])
def list_health_records(db: Session = Depends(get_db)) -> list[models.HealthRecord]:
    return crud.list_all(db, models.HealthRecord, order_by=models.HealthRecord.date.desc())


@router.post("/records", response_model=schemas.HealthRecordRead, status_code=201)
def create_health_record(
    payload: schemas.HealthRecordCreate, db: Session = Depends(get_db)
) -> models.HealthRecord:
    return crud.create(db, models.HealthRecord, payload.model_dump())


@router.patch("/records/{record_id}", response_model=schemas.HealthRecordRead)
def update_health_record(
    record_id: int, payload: schemas.HealthRecordUpdate, db: Session = Depends(get_db)
) -> models.HealthRecord:
    return crud.update(db, models.HealthRecord, record_id, payload.model_dump(exclude_unset=True))


@router.delete("/records/{record_id}", status_code=204)
def delete_health_record(record_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.HealthRecord, record_id)


@router.get("/metrics", response_model=list[schemas.HealthMetricRead])
def list_health_metrics(person: str, db: Session = Depends(get_db)) -> list[models.HealthMetric]:
    return crud.list_all(db, models.HealthMetric, order_by=models.HealthMetric.date.desc(), person=person)


@router.post("/metrics", response_model=schemas.HealthMetricRead, status_code=201)
def create_health_metric(
    payload: schemas.HealthMetricCreate, db: Session = Depends(get_db)
) -> models.HealthMetric:
    return crud.create(db, models.HealthMetric, payload.model_dump())


@router.delete("/metrics/{metric_id}", status_code=204)
def delete_health_metric(metric_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.HealthMetric, metric_id)


@router.get("/integrations/status")
def integrations_status() -> dict:
    """Zepp/Wyze scale sync status - honest about what real credentials/APIs are required."""
    wyze_configured = bool(settings.wyze_api_key and settings.wyze_key_id)
    return {
        "wyze": {
            "configured": wyze_configured,
            "connected": False,
            "message": (
                "Set WYZE_API_KEY and WYZE_KEY_ID (from the Wyze app -> Account -> "
                "Developer Options -> API keys) in the backend .env. Wyze doesn't publish "
                "a documented Wyze Scale readings API, so even with keys this endpoint "
                "isn't wired up yet - it's scaffolding for when/if that's available."
                if not wyze_configured
                else "Keys are set, but the Wyze Scale data endpoint isn't implemented yet."
            ),
        },
        "zepp": {
            "configured": False,
            "connected": False,
            "message": (
                "Zepp/Amazfit has no public consumer API for personal projects. Use the "
                "Zepp app's Profile -> Settings -> Export data feature to get a CSV, then "
                "import it below - that works today without any credentials."
            ),
        },
    }


@router.post("/metrics/import-csv")
async def import_metrics_csv(
    person: str, source: str = "zepp", file: UploadFile = File(...), db: Session = Depends(get_db)
) -> dict:
    """Imports a CSV with columns: date, steps, weight (any subset). Extra columns are ignored."""
    raw = (await file.read()).decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(raw))
    if reader.fieldnames is None:
        raise HTTPException(status_code=400, detail="Could not read CSV headers")

    fields = {f.strip().lower(): f for f in reader.fieldnames}
    if "date" not in fields:
        raise HTTPException(status_code=400, detail="CSV must include a 'date' column")

    def parse_date(raw: str):
        for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m/%d/%y"):
            try:
                return datetime.strptime(raw, fmt).date()
            except ValueError:
                continue
        return None

    imported = 0
    for row in reader:
        row_date_raw = (row.get(fields["date"]) or "").strip()
        row_date = parse_date(row_date_raw) if row_date_raw else None
        if not row_date:
            continue
        for col_key, metric_type, unit in (("steps", "steps", "steps"), ("weight", "weight", "lbs")):
            if col_key in fields:
                raw_value = (row.get(fields[col_key]) or "").strip()
                if raw_value:
                    try:
                        value = float(raw_value)
                    except ValueError:
                        continue
                    crud.create(
                        db,
                        models.HealthMetric,
                        {
                            "person": person,
                            "metric_type": metric_type,
                            "value": value,
                            "value_secondary": None,
                            "unit": unit,
                            "date": row_date,
                            "notes": None,
                            "source": source,
                        },
                    )
                    imported += 1

    return {"imported": imported}

