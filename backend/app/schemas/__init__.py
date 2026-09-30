import datetime as dt

from pydantic import BaseModel, ConfigDict


class ChoreBase(BaseModel):
    title: str
    assignee: str | None = None
    points: int = 0
    done: bool = False
    due_date: dt.date | None = None
    recurring: bool = False
    interval_days: int | None = None


class ChoreCreate(ChoreBase):
    pass


class ChoreUpdate(BaseModel):
    title: str | None = None
    assignee: str | None = None
    points: int | None = None
    done: bool | None = None
    due_date: dt.date | None = None
    recurring: bool | None = None
    interval_days: int | None = None


class ChoreRead(ChoreBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ChoreTemplateBase(BaseModel):
    age_band: str
    title: str
    points: int = 5
    recurring: bool = True
    interval_days: int = 7


class ChoreTemplateCreate(ChoreTemplateBase):
    pass


class ChoreTemplateUpdate(BaseModel):
    age_band: str | None = None
    title: str | None = None
    points: int | None = None
    recurring: bool | None = None
    interval_days: int | None = None


class ChoreTemplateRead(ChoreTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ApplyTemplateRequest(BaseModel):
    assignee: str
    age_band: str


class EventBase(BaseModel):
    title: str
    description: str | None = None
    start_time: dt.datetime
    location: str | None = None
    event_type: str = "reminder"
    recurring: bool = False
    interval_days: int | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_time: dt.datetime | None = None
    location: str | None = None
    event_type: str | None = None
    recurring: bool | None = None
    interval_days: int | None = None


class EventRead(EventBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    recurring_parent_id: int | None = None


class RecipeBase(BaseModel):
    title: str
    ingredients: str
    instructions: str | None = None
    tags: str | None = None


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    title: str | None = None
    ingredients: str | None = None
    instructions: str | None = None
    tags: str | None = None


class RecipeRead(RecipeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class PantryItemBase(BaseModel):
    name: str
    quantity: float = 1
    unit: str | None = None
    expiry_date: dt.date | None = None
    low_stock: bool = False
    photo_url: str | None = None


class PantryItemCreate(PantryItemBase):
    pass


class PantryItemUpdate(BaseModel):
    name: str | None = None
    quantity: float | None = None
    unit: str | None = None
    expiry_date: dt.date | None = None
    low_stock: bool | None = None
    photo_url: str | None = None


class PantryItemRead(PantryItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class GroceryItemBase(BaseModel):
    name: str
    quantity: float = 1
    purchased: bool = False
    photo_url: str | None = None
    store: str | None = None


class GroceryItemCreate(GroceryItemBase):
    pass


class GroceryItemUpdate(BaseModel):
    name: str | None = None
    quantity: float | None = None
    purchased: bool | None = None
    photo_url: str | None = None
    store: str | None = None


class GroceryItemRead(GroceryItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class NoteBase(BaseModel):
    title: str
    content: str | None = None
    pinned: bool = False


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    pinned: bool | None = None


class NoteRead(NoteBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class FinanceEntryBase(BaseModel):
    description: str
    amount: float
    category: str | None = None
    entry_type: str = "expense"
    date: dt.date
    is_bill: bool = False
    recurring_id: int | None = None


class FinanceEntryCreate(FinanceEntryBase):
    pass


class FinanceEntryUpdate(BaseModel):
    description: str | None = None
    amount: float | None = None
    category: str | None = None
    entry_type: str | None = None
    date: dt.date | None = None
    is_bill: bool | None = None


class FinanceEntryRead(FinanceEntryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class RecurringTransactionBase(BaseModel):
    description: str
    amount: float
    category: str | None = None
    entry_type: str = "expense"
    interval_days: int = 30
    start_date: dt.date
    is_bill: bool = False
    active: bool = True


class RecurringTransactionCreate(RecurringTransactionBase):
    pass


class RecurringTransactionUpdate(BaseModel):
    description: str | None = None
    amount: float | None = None
    category: str | None = None
    entry_type: str | None = None
    interval_days: int | None = None
    is_bill: bool | None = None
    active: bool | None = None


class RecurringTransactionRead(RecurringTransactionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    next_date: dt.date


class HealthRecordBase(BaseModel):
    family_member: str
    record_type: str = "appointment"
    description: str
    date: dt.date


class HealthRecordCreate(HealthRecordBase):
    pass


class HealthRecordUpdate(BaseModel):
    family_member: str | None = None
    record_type: str | None = None
    description: str | None = None
    date: dt.date | None = None


class HealthRecordRead(HealthRecordBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class HealthMetricBase(BaseModel):
    person: str
    metric_type: str
    value: float
    value_secondary: float | None = None
    unit: str | None = None
    date: dt.date
    notes: str | None = None
    source: str = "manual"


class HealthMetricCreate(HealthMetricBase):
    pass


class HealthMetricRead(HealthMetricBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProgressEntryBase(BaseModel):
    title: str
    value: str | None = None
    date: dt.date
    notes: str | None = None
    record_type: str | None = None
    score: float | None = None
    max_score: float | None = None
    status: str | None = None
    person: str | None = None


class ProgressEntryCreate(ProgressEntryBase):
    pass


class ProgressEntryUpdate(BaseModel):
    title: str | None = None
    value: str | None = None
    date: dt.date | None = None
    notes: str | None = None
    record_type: str | None = None
    score: float | None = None
    max_score: float | None = None
    status: str | None = None
    person: str | None = None


class ProgressEntryRead(ProgressEntryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    module: str


class StudySessionStart(BaseModel):
    subject: str
    person: str | None = None
    notes: str | None = None


class StudySessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    subject: str
    person: str | None = None
    start_time: dt.datetime
    end_time: dt.datetime | None = None
    duration_minutes: float | None = None
    notes: str | None = None


class StudentSubjectBase(BaseModel):
    person: str
    name: str
    category: str = "academic"
    sort_order: int = 0


class StudentSubjectCreate(StudentSubjectBase):
    pass


class StudentSubjectRead(StudentSubjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class GradeRecordBase(BaseModel):
    person: str
    subject: str
    period_label: str | None = None
    term_code: str
    term_order: int = 0
    mark: str | None = None
    is_projected: bool = False


class GradeRecordCreate(GradeRecordBase):
    pass


class GradeRecordUpdate(BaseModel):
    mark: str | None = None
    is_projected: bool | None = None


class GradeRecordRead(GradeRecordBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class DailyQuestionCreate(BaseModel):
    person: str
    subject: str
    question: str
    answer: str
    explanation: str | None = None
    difficulty: str = "medium"
    points: int = 5


class DailyQuestionAnswer(BaseModel):
    submitted_answer: str


class DailyQuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    person: str
    subject: str
    question: str
    answer: str
    explanation: str | None = None
    difficulty: str
    points: int
    date_assigned: dt.date | None = None
    answered: bool
    submitted_answer: str | None = None
    correct: bool | None = None


class ShlokaBankCreate(BaseModel):
    title: str
    text: str
    meaning: str | None = None
    difficulty: str = "simple"
    sort_order: int = 0
    points: int = 10


class ShlokaBankRead(ShlokaBankCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class WeeklyShlokaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    person: str
    shloka_id: int
    week_start: dt.date
    practiced: bool
    practiced_date: dt.date | None = None


class WeeklyShlokaWithDetail(BaseModel):
    assignment: WeeklyShlokaRead
    shloka: ShlokaBankRead


class StudyScheduleBase(BaseModel):
    person: str
    day_type: str
    start_time: str
    end_time: str


class StudyScheduleCreate(StudyScheduleBase):
    pass


class StudyScheduleUpdate(BaseModel):
    start_time: str | None = None
    end_time: str | None = None


class StudyScheduleRead(StudyScheduleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class StudyAttendanceCreate(BaseModel):
    person: str
    date: dt.date
    status: str


class StudyAttendanceRead(StudyAttendanceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SyllabusUnitCreate(BaseModel):
    person: str
    subject: str
    title: str
    parent_id: int | None = None
    sort_order: int = 0


class SyllabusUnitUpdate(BaseModel):
    completed: bool | None = None
    title: str | None = None


class SyllabusUnitRead(SyllabusUnitCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    completed: bool


class FamilyMemberBase(BaseModel):
    name: str
    role: str
    emoji: str = "🙂"
    color: str = "blue"
    status: str = "home"
    sort_order: int = 0


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMemberUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    emoji: str | None = None
    color: str | None = None
    status: str | None = None
    sort_order: int | None = None


class FamilyMemberRead(FamilyMemberBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str

