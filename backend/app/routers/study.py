import random
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/study", tags=["study"])


# --- Study timer / stopwatch -------------------------------------------------


@router.get("/sessions", response_model=list[schemas.StudySessionRead])
def list_sessions(db: Session = Depends(get_db)) -> list[models.StudySession]:
    return crud.list_all(db, models.StudySession, order_by=models.StudySession.start_time.desc())


@router.post("/sessions/start", response_model=schemas.StudySessionRead, status_code=201)
def start_session(payload: schemas.StudySessionStart, db: Session = Depends(get_db)) -> models.StudySession:
    return crud.create(
        db,
        models.StudySession,
        {
            "subject": payload.subject,
            "person": payload.person,
            "notes": payload.notes,
            "start_time": datetime.now(),
            "end_time": None,
            "duration_minutes": None,
        },
    )


@router.post("/sessions/{session_id}/stop", response_model=schemas.StudySessionRead)
def stop_session(session_id: int, db: Session = Depends(get_db)) -> models.StudySession:
    session = crud.get_or_404(db, models.StudySession, session_id)
    if session.end_time is not None:
        raise HTTPException(status_code=400, detail="Session already stopped")
    session.end_time = datetime.now()
    session.duration_minutes = round((session.end_time - session.start_time).total_seconds() / 60, 1)
    db.commit()
    db.refresh(session)
    return session


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(session_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.StudySession, session_id)


# --- Subjects (per person, academic / non-academic) --------------------------


@router.get("/subjects", response_model=list[schemas.StudentSubjectRead])
def list_subjects(person: str, db: Session = Depends(get_db)) -> list[models.StudentSubject]:
    return crud.list_all(db, models.StudentSubject, order_by=models.StudentSubject.sort_order, person=person)


@router.post("/subjects", response_model=schemas.StudentSubjectRead, status_code=201)
def create_subject(payload: schemas.StudentSubjectCreate, db: Session = Depends(get_db)) -> models.StudentSubject:
    return crud.create(db, models.StudentSubject, payload.model_dump())


@router.delete("/subjects/{subject_id}", status_code=204)
def delete_subject(subject_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.StudentSubject, subject_id)


# --- Grades table --------------------------------------------------------------


@router.get("/grades", response_model=list[schemas.GradeRecordRead])
def list_grades(person: str, db: Session = Depends(get_db)) -> list[models.GradeRecord]:
    return crud.list_all(db, models.GradeRecord, order_by=models.GradeRecord.id, person=person)


@router.post("/grades", response_model=schemas.GradeRecordRead, status_code=201)
def create_grade(payload: schemas.GradeRecordCreate, db: Session = Depends(get_db)) -> models.GradeRecord:
    return crud.create(db, models.GradeRecord, payload.model_dump())


@router.patch("/grades/{grade_id}", response_model=schemas.GradeRecordRead)
def update_grade(
    grade_id: int, payload: schemas.GradeRecordUpdate, db: Session = Depends(get_db)
) -> models.GradeRecord:
    return crud.update(db, models.GradeRecord, grade_id, payload.model_dump(exclude_unset=True))


@router.delete("/grades/{grade_id}", status_code=204)
def delete_grade(grade_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.GradeRecord, grade_id)


# --- Daily practice questions --------------------------------------------------


def _grade_answer(submitted: str, correct: str) -> bool:
    s, c = submitted.strip().lower(), correct.strip().lower()
    if s == c:
        return True
    try:
        return abs(float(s) - float(c)) < 1e-6
    except ValueError:
        return False


@router.get("/daily-questions", response_model=list[schemas.DailyQuestionRead])
def get_daily_questions(person: str, subject: str, db: Session = Depends(get_db)) -> list[models.DailyQuestion]:
    """Ensures up to 3 questions are assigned for today for this person+subject, then returns them."""
    today = date.today()
    todays = crud.list_all(db, models.DailyQuestion, person=person, subject=subject, date_assigned=today)
    if len(todays) >= 3:
        return todays

    need = 3 - len(todays)
    unused = [
        q
        for q in crud.list_all(db, models.DailyQuestion, person=person, subject=subject)
        if q.date_assigned is None
    ]
    random.shuffle(unused)
    picked = unused[:need]

    if len(picked) < need:
        # Recycle oldest already-answered questions so there's always a rotation.
        answered = [
            q
            for q in crud.list_all(db, models.DailyQuestion, person=person, subject=subject)
            if q.answered and q.date_assigned != today
        ]
        random.shuffle(answered)
        for q in answered:
            if len(picked) >= need:
                break
            q.answered = False
            q.submitted_answer = None
            q.correct = None
            picked.append(q)

    for q in picked:
        q.date_assigned = today
    if picked:
        db.commit()

    return todays + picked


@router.post("/daily-questions", response_model=schemas.DailyQuestionRead, status_code=201)
def create_daily_question(
    payload: schemas.DailyQuestionCreate, db: Session = Depends(get_db)
) -> models.DailyQuestion:
    return crud.create(db, models.DailyQuestion, {**payload.model_dump(), "date_assigned": None})


@router.post("/daily-questions/{question_id}/answer", response_model=schemas.DailyQuestionRead)
def answer_daily_question(
    question_id: int, payload: schemas.DailyQuestionAnswer, db: Session = Depends(get_db)
) -> models.DailyQuestion:
    q = crud.get_or_404(db, models.DailyQuestion, question_id)
    q.submitted_answer = payload.submitted_answer
    q.correct = _grade_answer(payload.submitted_answer, q.answer)
    q.answered = True
    db.commit()
    db.refresh(q)
    return q


@router.delete("/daily-questions/{question_id}", status_code=204)
def delete_daily_question(question_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.DailyQuestion, question_id)


# --- Weekly shloka --------------------------------------------------------------


def _week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


@router.get("/shloka-bank", response_model=list[schemas.ShlokaBankRead])
def list_shloka_bank(db: Session = Depends(get_db)) -> list[models.ShlokaBank]:
    return crud.list_all(db, models.ShlokaBank, order_by=models.ShlokaBank.sort_order)


@router.post("/shloka-bank", response_model=schemas.ShlokaBankRead, status_code=201)
def create_shloka(payload: schemas.ShlokaBankCreate, db: Session = Depends(get_db)) -> models.ShlokaBank:
    return crud.create(db, models.ShlokaBank, payload.model_dump())


@router.get("/weekly-shloka", response_model=schemas.WeeklyShlokaWithDetail | None)
def get_weekly_shloka(person: str, db: Session = Depends(get_db)):
    week_start = _week_start(date.today())
    existing = crud.list_all(db, models.WeeklyShlokaAssignment, person=person, week_start=week_start)
    bank = crud.list_all(db, models.ShlokaBank, order_by=models.ShlokaBank.sort_order)
    if not bank:
        return None

    if existing:
        assignment = existing[0]
    else:
        past = crud.list_all(db, models.WeeklyShlokaAssignment, person=person)
        used_ids = {a.shloka_id for a in past}
        next_shloka = next((s for s in bank if s.id not in used_ids), None)
        if next_shloka is None:
            next_shloka = bank[len(past) % len(bank)]
        assignment = crud.create(
            db,
            models.WeeklyShlokaAssignment,
            {
                "person": person,
                "shloka_id": next_shloka.id,
                "week_start": week_start,
                "practiced": False,
                "practiced_date": None,
            },
        )

    shloka = next((s for s in bank if s.id == assignment.shloka_id), bank[0])
    return {"assignment": assignment, "shloka": shloka}


@router.post("/weekly-shloka/{assignment_id}/practice", response_model=schemas.WeeklyShlokaRead)
def practice_weekly_shloka(assignment_id: int, db: Session = Depends(get_db)) -> models.WeeklyShlokaAssignment:
    assignment = crud.get_or_404(db, models.WeeklyShlokaAssignment, assignment_id)
    assignment.practiced = True
    assignment.practiced_date = date.today()
    db.commit()
    db.refresh(assignment)
    return assignment


# --- Activity log (non-academic subjects) --------------------------------------


@router.get("/activities", response_model=list[schemas.ProgressEntryRead])
def list_activities(person: str, subject: str, db: Session = Depends(get_db)) -> list[models.ProgressEntry]:
    module = f"activity:{subject}"
    return crud.list_all(db, models.ProgressEntry, order_by=models.ProgressEntry.date.desc(), module=module, person=person)


@router.post("/activities", response_model=schemas.ProgressEntryRead, status_code=201)
def create_activity(
    person: str, subject: str, payload: schemas.ProgressEntryCreate, db: Session = Depends(get_db)
) -> models.ProgressEntry:
    data = payload.model_dump()
    data["module"] = f"activity:{subject}"
    data["person"] = person
    data.setdefault("status", "pending")
    return crud.create(db, models.ProgressEntry, data)


@router.patch("/activities/{entry_id}", response_model=schemas.ProgressEntryRead)
def update_activity(
    entry_id: int, payload: schemas.ProgressEntryUpdate, db: Session = Depends(get_db)
) -> models.ProgressEntry:
    return crud.update(db, models.ProgressEntry, entry_id, payload.model_dump(exclude_unset=True))


@router.delete("/activities/{entry_id}", status_code=204)
def delete_activity(entry_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.ProgressEntry, entry_id)


# --- Rewards -------------------------------------------------------------------


@router.get("/points")
def get_study_points(person: str, db: Session = Depends(get_db)) -> dict:
    """Study reward points earned this calendar month only (resets automatically each month)."""
    today = date.today()

    def in_month(d: date | None) -> bool:
        return bool(d and d.year == today.year and d.month == today.month)

    questions = crud.list_all(db, models.DailyQuestion, person=person)
    question_points = sum(q.points for q in questions if q.correct and in_month(q.date_assigned))

    assignments = crud.list_all(db, models.WeeklyShlokaAssignment, person=person)
    bank = {s.id: s for s in crud.list_all(db, models.ShlokaBank)}
    shloka_points = sum(
        bank[a.shloka_id].points
        for a in assignments
        if a.practiced and in_month(a.practiced_date) and a.shloka_id in bank
    )

    activities = [e for e in crud.list_all(db, models.ProgressEntry, person=person) if e.module.startswith("activity:")]
    activity_points = sum(5 for e in activities if e.status == "done" and in_month(e.date))

    attendance = crud.list_all(db, models.StudyAttendance, person=person)
    attendance_points = sum(
        ATTENDANCE_POINTS.get(a.status, 0) for a in attendance if in_month(a.date)
    )

    return {
        "total": question_points + shloka_points + activity_points + attendance_points,
        "questions": question_points,
        "shloka": shloka_points,
        "activities": activity_points,
        "attendance": attendance_points,
    }


# --- Study schedule + attendance (rewards/deduct/skip) -------------------------

ATTENDANCE_POINTS = {"attended": 10, "missed": -5, "skipped": 0}


@router.get("/schedule", response_model=list[schemas.StudyScheduleRead])
def list_schedule(person: str, db: Session = Depends(get_db)) -> list[models.StudySchedule]:
    return crud.list_all(db, models.StudySchedule, person=person)


@router.post("/schedule", response_model=schemas.StudyScheduleRead, status_code=201)
def upsert_schedule(payload: schemas.StudyScheduleCreate, db: Session = Depends(get_db)) -> models.StudySchedule:
    existing = crud.list_all(db, models.StudySchedule, person=payload.person, day_type=payload.day_type)
    if existing:
        return crud.update(
            db, models.StudySchedule, existing[0].id,
            {"start_time": payload.start_time, "end_time": payload.end_time},
        )
    return crud.create(db, models.StudySchedule, payload.model_dump())


@router.delete("/schedule/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.StudySchedule, schedule_id)


@router.get("/attendance", response_model=list[schemas.StudyAttendanceRead])
def list_attendance(person: str, db: Session = Depends(get_db)) -> list[models.StudyAttendance]:
    return crud.list_all(db, models.StudyAttendance, order_by=models.StudyAttendance.date.desc(), person=person)


@router.post("/attendance", response_model=schemas.StudyAttendanceRead, status_code=201)
def record_attendance(payload: schemas.StudyAttendanceCreate, db: Session = Depends(get_db)) -> models.StudyAttendance:
    existing = crud.list_all(db, models.StudyAttendance, person=payload.person, date=payload.date)
    if existing:
        return crud.update(db, models.StudyAttendance, existing[0].id, {"status": payload.status})
    return crud.create(db, models.StudyAttendance, payload.model_dump())


# --- Syllabus tree (TEKS-aligned units/chapters, per person+subject) -----------


@router.get("/syllabus", response_model=list[schemas.SyllabusUnitRead])
def list_syllabus(person: str, subject: str, db: Session = Depends(get_db)) -> list[models.SyllabusUnit]:
    return crud.list_all(
        db, models.SyllabusUnit, order_by=models.SyllabusUnit.sort_order, person=person, subject=subject
    )


@router.patch("/syllabus/{unit_id}", response_model=schemas.SyllabusUnitRead)
def update_syllabus_unit(
    unit_id: int, payload: schemas.SyllabusUnitUpdate, db: Session = Depends(get_db)
) -> models.SyllabusUnit:
    return crud.update(db, models.SyllabusUnit, unit_id, payload.model_dump(exclude_unset=True))


@router.post("/syllabus", response_model=schemas.SyllabusUnitRead, status_code=201)
def create_syllabus_unit(payload: schemas.SyllabusUnitCreate, db: Session = Depends(get_db)) -> models.SyllabusUnit:
    return crud.create(db, models.SyllabusUnit, payload.model_dump())


@router.delete("/syllabus/{unit_id}", status_code=204)
def delete_syllabus_unit(unit_id: int, db: Session = Depends(get_db)) -> None:
    crud.delete(db, models.SyllabusUnit, unit_id)


# --- GPA + rule-based grade analysis --------------------------------------------

GPA_SCALE = [(90, 4.0), (80, 3.0), (70, 2.0), (60, 1.0), (0, 0.0)]
WEIGHTED_BONUS_KEYWORDS = ("ap", "honors", "pre-ap", "ib")


def _numeric_gpa_points(mark: str) -> float | None:
    try:
        score = float(mark)
    except (TypeError, ValueError):
        return None
    for threshold, points in GPA_SCALE:
        if score >= threshold:
            return points
    return 0.0


@router.get("/report-card")
def get_report_card(person: str, db: Session = Depends(get_db)) -> dict:
    """Computes unweighted + weighted GPA from FIN (final) grades, plus a rule-based analysis."""
    grades = crud.list_all(db, models.GradeRecord, person=person)
    finals = [g for g in grades if g.term_code == "FIN" and g.mark is not None]

    subject_points: list[dict] = []
    for g in finals:
        base = _numeric_gpa_points(g.mark)
        if base is None:
            continue
        is_weighted = any(k in g.subject.lower() for k in WEIGHTED_BONUS_KEYWORDS)
        weighted = min(base + 1.0, 5.0) if is_weighted else base
        subject_points.append({"subject": g.subject, "mark": g.mark, "unweighted": base, "weighted": weighted})

    unweighted_gpa = round(sum(s["unweighted"] for s in subject_points) / len(subject_points), 2) if subject_points else None
    weighted_gpa = round(sum(s["weighted"] for s in subject_points) / len(subject_points), 2) if subject_points else None

    analysis: list[str] = []
    if subject_points:
        best = max(subject_points, key=lambda s: s["unweighted"])
        worst = min(subject_points, key=lambda s: s["unweighted"])
        analysis.append(f"Strongest subject: {best['subject']} ({best['mark']}).")
        if worst["subject"] != best["subject"]:
            analysis.append(f"Needs the most attention: {worst['subject']} ({worst['mark']}).")
        low = [s for s in subject_points if _try_float(s["mark"]) is not None and _try_float(s["mark"]) < 75]
        if low:
            analysis.append(
                "Below 75: " + ", ".join(f"{s['subject']} ({s['mark']})" for s in low) + " — consider extra practice time."
            )
        else:
            analysis.append("All tracked subjects are at or above 75 — solid standing across the board.")
        if weighted_gpa and unweighted_gpa and weighted_gpa > unweighted_gpa:
            analysis.append(
                f"Weighted GPA ({weighted_gpa}) is higher than unweighted ({unweighted_gpa}) thanks to AP/Honors coursework."
            )
    else:
        analysis.append("No final grades recorded yet — GPA will appear once FIN marks are entered.")

    return {
        "unweighted_gpa": unweighted_gpa,
        "weighted_gpa": weighted_gpa,
        "subjects": subject_points,
        "analysis": analysis,
        "analysis_note": "Rule-based summary computed from your entered grades - not an external AI call.",
    }


def _try_float(v: str) -> float | None:
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

