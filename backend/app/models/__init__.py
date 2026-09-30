from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Chore(Base):
    __tablename__ = "chores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    assignee: Mapped[str | None] = mapped_column(String(100), nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=0)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    interval_days: Mapped[int | None] = mapped_column(Integer, nullable=True)


class ChoreTemplate(Base):
    __tablename__ = "chore_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    age_band: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(200))
    points: Mapped[int] = mapped_column(Integer, default=5)
    recurring: Mapped[bool] = mapped_column(Boolean, default=True)
    interval_days: Mapped[int] = mapped_column(Integer, default=7)


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    event_type: Mapped[str] = mapped_column(String(20), default="reminder")
    recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    interval_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    recurring_parent_id: Mapped[int | None] = mapped_column(Integer, nullable=True)


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    ingredients: Mapped[str] = mapped_column(Text)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[str | None] = mapped_column(String(200), nullable=True)


class PantryItem(Base):
    __tablename__ = "pantry_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[float] = mapped_column(Float, default=1)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    low_stock: Mapped[bool] = mapped_column(Boolean, default=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)


class GroceryItem(Base):
    __tablename__ = "grocery_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[float] = mapped_column(Float, default=1)
    purchased: Mapped[bool] = mapped_column(Boolean, default=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    store: Mapped[str | None] = mapped_column(String(50), nullable=True)


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    pinned: Mapped[bool] = mapped_column(Boolean, default=False)


class FinanceEntry(Base):
    __tablename__ = "finance_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    description: Mapped[str] = mapped_column(String(200))
    amount: Mapped[float] = mapped_column(Float)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entry_type: Mapped[str] = mapped_column(String(20), default="expense")
    date: Mapped[date] = mapped_column(Date)
    is_bill: Mapped[bool] = mapped_column(Boolean, default=False)
    recurring_id: Mapped[int | None] = mapped_column(Integer, nullable=True)


class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    description: Mapped[str] = mapped_column(String(200))
    amount: Mapped[float] = mapped_column(Float)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entry_type: Mapped[str] = mapped_column(String(20), default="expense")
    interval_days: Mapped[int] = mapped_column(Integer, default=30)
    start_date: Mapped[date] = mapped_column(Date)
    next_date: Mapped[date] = mapped_column(Date)
    is_bill: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class HealthRecord(Base):
    __tablename__ = "health_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    family_member: Mapped[str] = mapped_column(String(100))
    record_type: Mapped[str] = mapped_column(String(50), default="appointment")
    description: Mapped[str] = mapped_column(String(500))
    date: Mapped[date] = mapped_column(Date)


class HealthMetric(Base):
    """A single logged health measurement (weight, steps, BP, sugar, meditation, exercise, height)."""

    __tablename__ = "health_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    metric_type: Mapped[str] = mapped_column(String(30))
    value: Mapped[float] = mapped_column(Float)
    value_secondary: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    date: Mapped[date] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(20), default="manual")


class ProgressEntry(Base):
    """Shared table for school / SAT / spelling / shloka trackers, distinguished by `module`."""

    __tablename__ = "progress_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(200))
    value: Mapped[str | None] = mapped_column(String(200), nullable=True)
    date: Mapped[date] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    record_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    person: Mapped[str | None] = mapped_column(String(100), nullable=True)


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject: Mapped[str] = mapped_column(String(100))
    person: Mapped[str | None] = mapped_column(String(100), nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class StudentSubject(Base):
    """A subject/topic a family member is tracking (academic or non-academic)."""

    __tablename__ = "student_subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(20), default="academic")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class GradeRecord(Base):
    """One grade-period cell in a student's Skyward-style grades table."""

    __tablename__ = "grade_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    subject: Mapped[str] = mapped_column(String(200))
    period_label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    term_code: Mapped[str] = mapped_column(String(20))
    term_order: Mapped[int] = mapped_column(Integer, default=0)
    mark: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_projected: Mapped[bool] = mapped_column(Boolean, default=False)


class DailyQuestion(Base):
    """A practice question; part of a seeded/manual bank, rotated 3-per-day per person+subject."""

    __tablename__ = "daily_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    subject: Mapped[str] = mapped_column(String(100))
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(String(500))
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    points: Mapped[int] = mapped_column(Integer, default=5)
    date_assigned: Mapped[date | None] = mapped_column(Date, nullable=True)
    answered: Mapped[bool] = mapped_column(Boolean, default=False)
    submitted_answer: Mapped[str | None] = mapped_column(String(500), nullable=True)
    correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)


class ShlokaBank(Base):
    """Bank of shlokas, ordered simple -> advanced for weekly rotation."""

    __tablename__ = "shloka_bank"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    text: Mapped[str] = mapped_column(Text)
    meaning: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="simple")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    points: Mapped[int] = mapped_column(Integer, default=10)


class WeeklyShlokaAssignment(Base):
    __tablename__ = "weekly_shloka_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    shloka_id: Mapped[int] = mapped_column(Integer)
    week_start: Mapped[date] = mapped_column(Date)
    practiced: Mapped[bool] = mapped_column(Boolean, default=False)
    practiced_date: Mapped[date | None] = mapped_column(Date, nullable=True)


class StudySchedule(Base):
    """A weekly recurring study time slot for a person (one per day_type: weekday/weekend)."""

    __tablename__ = "study_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    day_type: Mapped[str] = mapped_column(String(10))  # "weekday" | "weekend"
    start_time: Mapped[str] = mapped_column(String(5))  # "HH:MM"
    end_time: Mapped[str] = mapped_column(String(5))  # "HH:MM"


class StudyAttendance(Base):
    """Daily record of whether a person kept their scheduled study slot."""

    __tablename__ = "study_attendance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20))  # "attended" | "missed" | "skipped"


class SyllabusUnit(Base):
    """A TEKS-aligned syllabus tree node: top-level unit (parent_id NULL) or chapter (parent_id set)."""

    __tablename__ = "syllabus_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person: Mapped[str] = mapped_column(String(100))
    subject: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(300))
    parent_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)


class FamilyMember(Base):
    __tablename__ = "family_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(50))
    emoji: Mapped[str] = mapped_column(String(10), default="🙂")
    color: Mapped[str] = mapped_column(String(20), default="blue")
    status: Mapped[str] = mapped_column(String(20), default="home")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
