from pathlib import Path

from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import models
from app.config import settings
from app.database import SessionLocal
from app.routers import (
    ai_assistant,
    ai_meals,
    calendar,
    chores,
    dashboard,
    family,
    finance,
    grocery,
    health_tracking,
    meals,
    notes,
    pantry,
    reports,
    sat_tracker,
    school,
    shloka_tracker,
    spelling_tracker,
    study,
    uploads,
)

def _run_migrations() -> None:
    """Apply any pending Alembic migrations on startup (creates DB fresh, or upgrades in place)."""
    backend_dir = Path(__file__).resolve().parent.parent
    alembic_cfg = AlembicConfig(str(backend_dir / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    alembic_command.upgrade(alembic_cfg, "head")


_run_migrations()


def _seed_family_members() -> None:
    """Seed default family members on first run so the dashboard isn't empty."""
    db = SessionLocal()
    try:
        if db.query(models.FamilyMember).count() > 0:
            return
        defaults = [
            {"name": "Vamshi", "role": "Parent", "emoji": "👨", "color": "blue", "sort_order": 0},
            {"name": "Hyma", "role": "Parent", "emoji": "👩", "color": "rose", "sort_order": 1},
            {"name": "Pranshu", "role": "Grade 10", "emoji": "🧑", "color": "violet", "sort_order": 2},
            {"name": "Anika", "role": "Grade 3", "emoji": "🧒", "color": "amber", "sort_order": 3},
        ]
        for member in defaults:
            db.add(models.FamilyMember(**member))
        db.commit()
    finally:
        db.close()


def _seed_chore_templates() -> None:
    """Seed default age-appropriate chore templates on first run."""
    db = SessionLocal()
    try:
        if db.query(models.ChoreTemplate).count() > 0:
            return
        defaults = [
            # young_child: K-2 (~5-7)
            {"age_band": "young_child", "title": "Make your bed", "points": 5, "recurring": True, "interval_days": 1},
            {"age_band": "young_child", "title": "Brush teeth", "points": 3, "recurring": True, "interval_days": 1},
            {"age_band": "young_child", "title": "Put toys away", "points": 5, "recurring": True, "interval_days": 1},
            {"age_band": "young_child", "title": "Feed the pet", "points": 5, "recurring": True, "interval_days": 1},
            {"age_band": "young_child", "title": "Put dirty clothes in hamper", "points": 3, "recurring": True, "interval_days": 1},
            # child: grades 3-6 (~8-11)
            {"age_band": "child", "title": "Set the table", "points": 5, "recurring": True, "interval_days": 1},
            {"age_band": "child", "title": "Clear the table", "points": 5, "recurring": True, "interval_days": 1},
            {"age_band": "child", "title": "Pack school bag", "points": 5, "recurring": True, "interval_days": 1},
            {"age_band": "child", "title": "Water the plants", "points": 5, "recurring": True, "interval_days": 7},
            {"age_band": "child", "title": "Vacuum bedroom", "points": 8, "recurring": True, "interval_days": 7},
            {"age_band": "child", "title": "Take out recycling", "points": 5, "recurring": True, "interval_days": 7},
            # teen: grades 7-12 (~12-18)
            {"age_band": "teen", "title": "Do the dishes", "points": 10, "recurring": True, "interval_days": 1},
            {"age_band": "teen", "title": "Do own laundry", "points": 10, "recurring": True, "interval_days": 7},
            {"age_band": "teen", "title": "Take out trash & recycling", "points": 8, "recurring": True, "interval_days": 7},
            {"age_band": "teen", "title": "Vacuum living areas", "points": 10, "recurring": True, "interval_days": 7},
            {"age_band": "teen", "title": "Mow the lawn / yard work", "points": 15, "recurring": True, "interval_days": 7},
            {"age_band": "teen", "title": "Cook one meal a week", "points": 15, "recurring": True, "interval_days": 7},
            # adult
            {"age_band": "adult", "title": "Grocery shopping", "points": 10, "recurring": True, "interval_days": 7},
            {"age_band": "adult", "title": "Meal planning", "points": 10, "recurring": True, "interval_days": 7},
            {"age_band": "adult", "title": "Pay bills", "points": 10, "recurring": True, "interval_days": 15},
            {"age_band": "adult", "title": "Home maintenance check", "points": 10, "recurring": True, "interval_days": 30},
            {"age_band": "adult", "title": "Family calendar review", "points": 5, "recurring": True, "interval_days": 7},
            {"age_band": "adult", "title": "Car maintenance check", "points": 10, "recurring": True, "interval_days": 90},
        ]
        for template in defaults:
            db.add(models.ChoreTemplate(**template))
        db.commit()
    finally:
        db.close()


def _seed_study_data() -> None:
    """Seed per-person subjects, a starter practice-question bank, shlokas, and real report-card grades."""
    db = SessionLocal()
    try:
        if db.query(models.StudentSubject).count() == 0:
            subjects = [
                {"person": "Anika", "name": "ELAR", "category": "academic", "sort_order": 0},
                {"person": "Anika", "name": "Math", "category": "academic", "sort_order": 1},
                {"person": "Anika", "name": "STEM", "category": "academic", "sort_order": 2},
                {"person": "Anika", "name": "Vocabulary", "category": "academic", "sort_order": 3},
                {"person": "Anika", "name": "Activities", "category": "non_academic", "sort_order": 4},
                {"person": "Anika", "name": "Shlokas", "category": "non_academic", "sort_order": 5},
                {"person": "Pranshu", "name": "SAT", "category": "academic", "sort_order": 0},
                {"person": "Pranshu", "name": "Algebra2", "category": "academic", "sort_order": 1},
                {"person": "Pranshu", "name": "Vocabulary", "category": "academic", "sort_order": 2},
                {"person": "Pranshu", "name": "Activities", "category": "non_academic", "sort_order": 3},
                {"person": "Pranshu", "name": "Shlokas", "category": "non_academic", "sort_order": 4},
                {"person": "Vamshi", "name": "Certification Courses", "category": "academic", "sort_order": 0},
                {"person": "Vamshi", "name": "Activities", "category": "non_academic", "sort_order": 1},
                {"person": "Vamshi", "name": "Shlokas", "category": "non_academic", "sort_order": 2},
                {"person": "Hyma", "name": "Certification Courses", "category": "academic", "sort_order": 0},
                {"person": "Hyma", "name": "Activities", "category": "non_academic", "sort_order": 1},
                {"person": "Hyma", "name": "Shlokas", "category": "non_academic", "sort_order": 2},
            ]
            for s in subjects:
                db.add(models.StudentSubject(**s))
            db.commit()

        if db.query(models.DailyQuestion).count() == 0:
            # NOTE: authored once as a starter bank (no live AI/websearch is wired into this app).
            questions: list[dict] = [
                # Anika - ELAR (Grade 3)
                {"person": "Anika", "subject": "ELAR", "question": "What is a noun? Give one example.",
                 "answer": "a person, place, or thing", "explanation": "Nouns name people, places, animals, or things — e.g. dog, school, book."},
                {"person": "Anika", "subject": "ELAR", "question": "Which word is a synonym for 'happy': sad, joyful, angry, or tired?",
                 "answer": "joyful", "explanation": "'Joyful' means feeling or showing great happiness, just like 'happy'."},
                {"person": "Anika", "subject": "ELAR", "question": "Find the verb in this sentence: 'The cat runs fast.'",
                 "answer": "runs", "explanation": "A verb shows action. 'Runs' is the action the cat is doing."},
                {"person": "Anika", "subject": "ELAR", "question": "What is the plural of 'child'?",
                 "answer": "children", "explanation": "'Child' has an irregular plural form: children (not 'childs')."},
                {"person": "Anika", "subject": "ELAR", "question": "Is this sentence a statement, question, or command? 'Please close the door.'",
                 "answer": "command", "explanation": "It asks someone to do something, so it is a command (an imperative sentence)."},
                {"person": "Anika", "subject": "ELAR", "question": "What is the opposite (antonym) of 'big'?",
                 "answer": "small", "explanation": "An antonym is a word with the opposite meaning; 'small' is the opposite of 'big'."},
                # Anika - Math (Grade 3)
                {"person": "Anika", "subject": "Math", "question": "What is 7 x 8?",
                 "answer": "56", "explanation": "7 groups of 8 = 56 (7x8=56)."},
                {"person": "Anika", "subject": "Math", "question": "What is 1/2 + 1/4?",
                 "answer": "3/4", "explanation": "Convert 1/2 to 2/4, then 2/4 + 1/4 = 3/4."},
                {"person": "Anika", "subject": "Math", "question": "Round 47 to the nearest ten.",
                 "answer": "50", "explanation": "47 is closer to 50 than to 40, so it rounds up to 50."},
                {"person": "Anika", "subject": "Math", "question": "What is 144 divided by 12?",
                 "answer": "12", "explanation": "12 x 12 = 144, so 144 / 12 = 12."},
                {"person": "Anika", "subject": "Math", "question": "Which is greater: 3/4 or 2/3?",
                 "answer": "3/4", "explanation": "3/4 = 0.75 and 2/3 = 0.667, so 3/4 is greater."},
                {"person": "Anika", "subject": "Math", "question": "What is the value of the 5 in 358?",
                 "answer": "50", "explanation": "The 5 is in the tens place, so its value is 5 tens = 50."},
                # Anika - STEM (Grade 3)
                {"person": "Anika", "subject": "STEM", "question": "What are the three states of matter?",
                 "answer": "solid, liquid, gas", "explanation": "Matter can exist as a solid (fixed shape), liquid (takes shape of container), or gas (spreads to fill space)."},
                {"person": "Anika", "subject": "STEM", "question": "What force pulls objects toward the Earth?",
                 "answer": "gravity", "explanation": "Gravity is the force that pulls objects down toward the Earth's center."},
                {"person": "Anika", "subject": "STEM", "question": "What do plants need to make their own food?",
                 "answer": "sunlight, water, and carbon dioxide", "explanation": "This process is called photosynthesis — plants use sunlight, water, and CO2 to make food (glucose)."},
                {"person": "Anika", "subject": "STEM", "question": "What is the name of our galaxy?",
                 "answer": "the milky way", "explanation": "Earth is part of the Milky Way galaxy, a huge collection of stars, planets, and dust."},
                {"person": "Anika", "subject": "STEM", "question": "What simple machine is a seesaw an example of?",
                 "answer": "a lever", "explanation": "A seesaw pivots around a fixed point (fulcrum), which is the definition of a lever."},
                {"person": "Anika", "subject": "STEM", "question": "What do we call animals that eat only plants?",
                 "answer": "herbivores", "explanation": "Herbivores are animals whose diet consists only of plants, like cows and rabbits."},
                # Anika - Vocabulary
                {"person": "Anika", "subject": "Vocabulary", "question": "What does 'enormous' mean?",
                 "answer": "very large; huge", "explanation": "'Enormous' describes something extremely big in size."},
                {"person": "Anika", "subject": "Vocabulary", "question": "What does 'curious' mean?",
                 "answer": "eager to learn or know something", "explanation": "A curious person wants to explore and find out new things."},
                {"person": "Anika", "subject": "Vocabulary", "question": "What does 'brave' mean?",
                 "answer": "showing courage; not afraid", "explanation": "Being brave means facing something scary or difficult without giving in to fear."},
                {"person": "Anika", "subject": "Vocabulary", "question": "What does 'gigantic' mean?",
                 "answer": "extremely large", "explanation": "'Gigantic' is an even stronger word than 'big' — it means enormous or giant-sized."},
                {"person": "Anika", "subject": "Vocabulary", "question": "What does 'ancient' mean?",
                 "answer": "very old; from a long time ago", "explanation": "'Ancient' describes things that existed a very long time in the past, like ancient Egypt."},
                {"person": "Anika", "subject": "Vocabulary", "question": "What does 'delicate' mean?",
                 "answer": "easily broken or damaged; fragile", "explanation": "Delicate things must be handled carefully because they break easily."},
                # Pranshu - SAT (Grade 10)
                {"person": "Pranshu", "subject": "SAT", "question": "If 3x + 5 = 20, what is x?",
                 "answer": "5", "explanation": "Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5."},
                {"person": "Pranshu", "subject": "SAT", "question": "Choose the best synonym for 'ubiquitous': rare, everywhere, hidden, or temporary.",
                 "answer": "everywhere", "explanation": "'Ubiquitous' means present or found everywhere."},
                {"person": "Pranshu", "subject": "SAT", "question": "Simplify: (2x^2)(3x^3)",
                 "answer": "6x^5", "explanation": "Multiply coefficients (2x3=6) and add exponents (x^2 * x^3 = x^5)."},
                {"person": "Pranshu", "subject": "SAT", "question": "What is the area of a circle with radius 4 (in terms of pi)?",
                 "answer": "16pi", "explanation": "Area = pi*r^2 = pi*4^2 = 16*pi (approximately 50.3)."},
                {"person": "Pranshu", "subject": "SAT", "question": "Fix the error: 'Each of the students have their own book.'",
                 "answer": "each of the students has their own book",
                 "explanation": "'Each' is singular, so it takes the singular verb 'has', not 'have'."},
                {"person": "Pranshu", "subject": "SAT", "question": "What is 15% of 200?",
                 "answer": "30", "explanation": "15% of 200 = 0.15 * 200 = 30."},
                # Pranshu - Algebra2
                {"person": "Pranshu", "subject": "Algebra2", "question": "Solve for x: x^2 - 9 = 0",
                 "answer": "x = 3 or x = -3", "explanation": "x^2 = 9, so x = sqrt(9) = ±3."},
                {"person": "Pranshu", "subject": "Algebra2", "question": "What is the slope of the line through (2,3) and (4,7)?",
                 "answer": "2", "explanation": "Slope = (y2-y1)/(x2-x1) = (7-3)/(4-2) = 4/2 = 2."},
                {"person": "Pranshu", "subject": "Algebra2", "question": "Factor: x^2 + 5x + 6",
                 "answer": "(x+2)(x+3)", "explanation": "Find two numbers that multiply to 6 and add to 5: 2 and 3."},
                {"person": "Pranshu", "subject": "Algebra2", "question": "Solve the system: y = 2x, y = x + 3",
                 "answer": "x = 3, y = 6", "explanation": "Set 2x = x + 3, so x = 3; then y = 2(3) = 6."},
                {"person": "Pranshu", "subject": "Algebra2", "question": "What is log base 2 of 8?",
                 "answer": "3", "explanation": "2^3 = 8, so log base 2 of 8 = 3."},
                {"person": "Pranshu", "subject": "Algebra2", "question": "Simplify: (x^3)/(x^5)",
                 "answer": "1/x^2", "explanation": "Subtract exponents: x^(3-5) = x^-2 = 1/x^2."},
                # Pranshu - Vocabulary (SAT-level)
                {"person": "Pranshu", "subject": "Vocabulary", "question": "Define 'ephemeral'.",
                 "answer": "lasting a very short time; fleeting", "explanation": "Something ephemeral exists only briefly, like morning dew."},
                {"person": "Pranshu", "subject": "Vocabulary", "question": "Define 'meticulous'.",
                 "answer": "showing great attention to detail; very careful",
                 "explanation": "A meticulous person is extremely careful and precise about details."},
                {"person": "Pranshu", "subject": "Vocabulary", "question": "Define 'candid'.",
                 "answer": "truthful and straightforward; frank", "explanation": "Being candid means being honest and direct, even if blunt."},
                {"person": "Pranshu", "subject": "Vocabulary", "question": "Define 'resilient'.",
                 "answer": "able to recover quickly from difficulties",
                 "explanation": "A resilient person bounces back from setbacks or hardship."},
                {"person": "Pranshu", "subject": "Vocabulary", "question": "Define 'ambiguous'.",
                 "answer": "open to more than one interpretation; unclear",
                 "explanation": "An ambiguous statement can be understood in more than one way."},
                {"person": "Pranshu", "subject": "Vocabulary", "question": "Define 'pragmatic'.",
                 "answer": "dealing with things sensibly and realistically",
                 "explanation": "A pragmatic approach focuses on practical results rather than theory or ideals."},
                # Vamshi & Hyma - Certification Courses (AI fundamentals tips & tricks)
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What does 'LLM' stand for in AI?",
                 "answer": "Large Language Model", "explanation": "An LLM is a neural network trained on massive text data to understand and generate human language."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is 'prompt engineering'?",
                 "answer": "crafting inputs to get better outputs from an AI model",
                 "explanation": "Prompt engineering means designing clear, specific instructions/context so an LLM produces more accurate or useful responses."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is 'overfitting' in machine learning?",
                 "answer": "when a model learns training data too well and performs poorly on new data",
                 "explanation": "An overfit model memorizes noise/details in training data instead of general patterns, hurting real-world accuracy."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is RAG (Retrieval-Augmented Generation)?",
                 "answer": "combining a search/retrieval step with an LLM to ground answers in real data",
                 "explanation": "RAG fetches relevant documents/context first, then feeds them to the LLM, reducing hallucination and enabling up-to-date answers."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is a 'token' in the context of LLMs?",
                 "answer": "a chunk of text (word/subword) the model processes as a unit",
                 "explanation": "Models break text into tokens (often sub-word pieces) for processing; pricing and context limits are usually measured in tokens."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is 'fine-tuning' an AI model?",
                 "answer": "further training a pre-trained model on a smaller, specific dataset",
                 "explanation": "Fine-tuning adapts a general-purpose model to a specific task or domain without training from scratch."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What does 'LLM' stand for in AI?",
                 "answer": "Large Language Model", "explanation": "An LLM is a neural network trained on massive text data to understand and generate human language."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is 'prompt engineering'?",
                 "answer": "crafting inputs to get better outputs from an AI model",
                 "explanation": "Prompt engineering means designing clear, specific instructions/context so an LLM produces more accurate or useful responses."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is 'overfitting' in machine learning?",
                 "answer": "when a model learns training data too well and performs poorly on new data",
                 "explanation": "An overfit model memorizes noise/details in training data instead of general patterns, hurting real-world accuracy."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is RAG (Retrieval-Augmented Generation)?",
                 "answer": "combining a search/retrieval step with an LLM to ground answers in real data",
                 "explanation": "RAG fetches relevant documents/context first, then feeds them to the LLM, reducing hallucination and enabling up-to-date answers."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is a 'token' in the context of LLMs?",
                 "answer": "a chunk of text (word/subword) the model processes as a unit",
                 "explanation": "Models break text into tokens (often sub-word pieces) for processing; pricing and context limits are usually measured in tokens."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is 'fine-tuning' an AI model?",
                 "answer": "further training a pre-trained model on a smaller, specific dataset",
                 "explanation": "Fine-tuning adapts a general-purpose model to a specific task or domain without training from scratch."},
            ]
            for q in questions:
                db.add(models.DailyQuestion(**q, difficulty="medium", points=5, date_assigned=None))
            db.commit()

        if db.query(models.ShlokaBank).count() == 0:
            shlokas = [
                {"title": "Om", "text": "ॐ (Om)",
                 "meaning": "The primordial sound representing the universe; the most sacred syllable.",
                 "difficulty": "simple", "sort_order": 0, "points": 5},
                {"title": "Gayatri Beej", "text": "ॐ भूर्भुवः स्वः",
                 "meaning": "Om, the earth, the atmosphere, the heavens.",
                 "difficulty": "simple", "sort_order": 1, "points": 5},
                {"title": "Shanti Mantra (Short)", "text": "ॐ शांतिः शांतिः शांतिः",
                 "meaning": "Om, peace, peace, peace.",
                 "difficulty": "simple", "sort_order": 2, "points": 5},
                {"title": "Gayatri Mantra", "text": "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
                 "meaning": "We meditate on the glory of the Creator; may He illuminate our intellect.",
                 "difficulty": "medium", "sort_order": 3, "points": 10},
                {"title": "Asato Ma Sadgamaya", "text": "असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय।",
                 "meaning": "Lead me from untruth to truth, from darkness to light, from death to immortality.",
                 "difficulty": "medium", "sort_order": 4, "points": 10},
                {"title": "Karmanye Vadhikaraste (Gita 2.47)",
                 "text": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
                 "meaning": "You have the right to perform your duty, but never to the fruits of your actions.",
                 "difficulty": "advanced", "sort_order": 5, "points": 15},
            ]
            for s in shlokas:
                db.add(models.ShlokaBank(**s))
            db.commit()

        if db.query(models.GradeRecord).count() == 0:
            pranshu_terms = {"C1": 1, "C2": 2, "SE1": 3, "S1": 4, "C3": 5, "C4": 6, "SE2": 7, "S2": 8, "FIN": 9}
            pranshu_classes = [
                ("World History AP", "Period 1 - Year", 86),
                ("Algebra II Honors", "Period 2 - Year", 84),
                ("English II Honors", "Period 3 - Year", 94),
                ("Spanish II", "Period 4 - Year", 84),
                ("Chemistry Honors", "Period 5 - Year", 85),
                ("Health Science Theory", "Period 6 - Year", 88),
                ("Biology AP", "Period 7 - Year", 80),
            ]
            for subject, period, mark in pranshu_classes:
                for term in ("C1", "S1", "FIN"):
                    db.add(models.GradeRecord(
                        person="Pranshu", subject=subject, period_label=period,
                        term_code=term, term_order=pranshu_terms[term], mark=str(mark),
                    ))

            anika_terms = {"C1": 1, "C2": 2, "S1": 3, "C3": 4, "C4": 5, "S2": 6, "FIN": 7}
            anika_classes = [
                ("Homeroom 03", "Period 01 - Year", None),
                ("ELAR 03", "Period 02 - Year", 76),
                ("Math 03", "Period 03 - Year", 81),
                ("Science 03", "Period 04 - Year", 88),
                ("Social Studies 03", "Period 05 - Year", 83),
                ("Music 03", "Period 06 - Year", None),
                ("Art 03", "Period 07 - Year", None),
                ("PE 03", "Period 08 - Year", "E"),
                ("STEM", "Period 10 - Year", None),
            ]
            for subject, period, mark in anika_classes:
                if mark is None:
                    continue
                for term in ("C1", "S1", "FIN"):
                    db.add(models.GradeRecord(
                        person="Anika", subject=subject, period_label=period,
                        term_code=term, term_order=anika_terms[term], mark=str(mark),
                    ))
            db.commit()
    finally:
        db.close()


def _seed_syllabus() -> None:
    """Seed a TEKS-aligned unit/chapter tree for each student's core subjects.

    NOTE: authored from general knowledge of published Texas Essential Knowledge
    and Skills (TEKS) standards and typical Argyle ISD course scope/sequence -
    not a live pull from the TEA or district website (no such public API exists).
    """
    db = SessionLocal()
    try:
        if db.query(models.SyllabusUnit).count() > 0:
            return

        def add_tree(person: str, subject: str, units: list[tuple[str, list[str]]]) -> None:
            for u_idx, (unit_title, chapters) in enumerate(units):
                unit = models.SyllabusUnit(
                    person=person, subject=subject, title=unit_title,
                    parent_id=None, sort_order=u_idx, completed=False,
                )
                db.add(unit)
                db.flush()
                for c_idx, chapter_title in enumerate(chapters):
                    db.add(models.SyllabusUnit(
                        person=person, subject=subject, title=chapter_title,
                        parent_id=unit.id, sort_order=c_idx, completed=False,
                    ))

        add_tree("Pranshu", "Algebra II Honors", [
            ("Unit 1: Linear Functions & Systems", ["Linear equations & inequalities", "Systems of equations", "Absolute value functions"]),
            ("Unit 2: Quadratic Functions", ["Factoring & the quadratic formula", "Graphing parabolas", "Complex numbers"]),
            ("Unit 3: Polynomial & Rational Functions", ["Polynomial operations", "Rational expressions", "Asymptotes & end behavior"]),
            ("Unit 4: Exponential & Logarithmic Functions", ["Exponential growth/decay", "Logarithm properties", "Solving exponential equations"]),
        ])
        add_tree("Pranshu", "Biology AP", [
            ("Unit 1: Chemistry of Life", ["Biomolecules", "Water & pH", "Enzymes"]),
            ("Unit 2: Cell Structure & Function", ["Cell organelles", "Membrane transport", "Cell communication"]),
            ("Unit 3: Cellular Energetics", ["Photosynthesis", "Cellular respiration"]),
            ("Unit 4: Genetics", ["Mendelian genetics", "DNA replication & protein synthesis", "Biotechnology"]),
            ("Unit 5: Evolution & Ecology", ["Natural selection", "Population genetics", "Ecosystems & energy flow"]),
        ])
        add_tree("Pranshu", "English II Honors", [
            ("Unit 1: Literary Analysis", ["Elements of fiction", "Theme & tone", "Figurative language"]),
            ("Unit 2: Argumentative Writing", ["Claims & evidence", "Rhetorical devices", "Research & citation"]),
            ("Unit 3: World Literature", ["Short stories in translation", "Poetry analysis", "Drama (e.g. a Shakespeare play)"]),
            ("Unit 4: Composition & Grammar", ["Sentence structure & style", "Revision strategies"]),
        ])
        add_tree("Pranshu", "World History AP", [
            ("Unit 1: The Global Tapestry (c. 1200-1450)", ["State-building in Africa/Asia/Europe", "Trade networks"]),
            ("Unit 2: Networks of Exchange (c. 1450-1750)", ["Age of Exploration", "Columbian Exchange"]),
            ("Unit 3: Land-Based Empires", ["Ottoman, Safavid, Mughal empires"]),
            ("Unit 4: Revolutions (c. 1750-1900)", ["Enlightenment & political revolutions", "Industrial Revolution"]),
            ("Unit 5: 20th Century Global Conflict", ["World War I & II", "Cold War"]),
        ])

        add_tree("Anika", "Math 03", [
            ("Unit 1: Place Value & Rounding", ["Place value to 10,000", "Rounding whole numbers"]),
            ("Unit 2: Multiplication & Division", ["Multiplication facts & strategies", "Division facts & strategies"]),
            ("Unit 3: Fractions", ["Understanding fractions", "Comparing & ordering fractions", "Adding fractions with like denominators"]),
            ("Unit 4: Geometry & Measurement", ["2D shapes & attributes", "Area & perimeter", "Time & elapsed time"]),
        ])
        add_tree("Anika", "ELAR 03", [
            ("Unit 1: Reading Comprehension", ["Main idea & details", "Making inferences", "Author's purpose"]),
            ("Unit 2: Vocabulary & Word Study", ["Prefixes & suffixes", "Context clues", "Synonyms & antonyms"]),
            ("Unit 3: Writing", ["Personal narrative", "Informational writing", "Grammar & sentence structure"]),
        ])
        add_tree("Anika", "Science 03", [
            ("Unit 1: Matter & Energy", ["Properties of matter", "States of matter & changes"]),
            ("Unit 2: Force, Motion & Energy", ["Push and pull forces", "Simple machines"]),
            ("Unit 3: Earth & Space", ["The water cycle", "Weather patterns", "Day/night & seasons"]),
            ("Unit 4: Organisms & Environments", ["Life cycles", "Adaptations", "Food chains"]),
        ])
        add_tree("Anika", "Social Studies 03", [
            ("Unit 1: Community & Citizenship", ["Rules & laws", "Good citizenship"]),
            ("Unit 2: Texas History", ["Early Texas settlers", "Texas symbols & landmarks"]),
            ("Unit 3: Economics", ["Goods & services", "Needs vs. wants"]),
            ("Unit 4: Geography", ["Maps & map skills", "Regions of Texas"]),
        ])

        db.commit()
    finally:
        db.close()


_seed_family_members()
_seed_chore_templates()
_seed_study_data()
_seed_syllabus()


def _seed_additions() -> None:
    """Idempotent top-up seeding for pieces added after the initial bulk seed already ran."""
    db = SessionLocal()
    try:
        if db.query(models.StudentSubject).filter_by(person="Vamshi").count() == 0:
            for s in [
                {"person": "Vamshi", "name": "Certification Courses", "category": "academic", "sort_order": 0},
                {"person": "Vamshi", "name": "Activities", "category": "non_academic", "sort_order": 1},
                {"person": "Vamshi", "name": "Shlokas", "category": "non_academic", "sort_order": 2},
                {"person": "Hyma", "name": "Certification Courses", "category": "academic", "sort_order": 0},
                {"person": "Hyma", "name": "Activities", "category": "non_academic", "sort_order": 1},
                {"person": "Hyma", "name": "Shlokas", "category": "non_academic", "sort_order": 2},
            ]:
                db.add(models.StudentSubject(**s))
            db.commit()

        if db.query(models.DailyQuestion).filter_by(subject="Certification Courses").count() == 0:
            cert_questions = [
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What does 'LLM' stand for in AI?",
                 "answer": "Large Language Model", "explanation": "An LLM is a neural network trained on massive text data to understand and generate human language."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is 'prompt engineering'?",
                 "answer": "crafting inputs to get better outputs from an AI model",
                 "explanation": "Prompt engineering means designing clear, specific instructions/context so an LLM produces more accurate or useful responses."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is 'overfitting' in machine learning?",
                 "answer": "when a model learns training data too well and performs poorly on new data",
                 "explanation": "An overfit model memorizes noise/details in training data instead of general patterns, hurting real-world accuracy."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is RAG (Retrieval-Augmented Generation)?",
                 "answer": "combining a search/retrieval step with an LLM to ground answers in real data",
                 "explanation": "RAG fetches relevant documents/context first, then feeds them to the LLM, reducing hallucination and enabling up-to-date answers."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is a 'token' in the context of LLMs?",
                 "answer": "a chunk of text (word/subword) the model processes as a unit",
                 "explanation": "Models break text into tokens (often sub-word pieces) for processing; pricing and context limits are usually measured in tokens."},
                {"person": "Vamshi", "subject": "Certification Courses", "question": "What is 'fine-tuning' an AI model?",
                 "answer": "further training a pre-trained model on a smaller, specific dataset",
                 "explanation": "Fine-tuning adapts a general-purpose model to a specific task or domain without training from scratch."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What does 'LLM' stand for in AI?",
                 "answer": "Large Language Model", "explanation": "An LLM is a neural network trained on massive text data to understand and generate human language."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is 'prompt engineering'?",
                 "answer": "crafting inputs to get better outputs from an AI model",
                 "explanation": "Prompt engineering means designing clear, specific instructions/context so an LLM produces more accurate or useful responses."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is 'overfitting' in machine learning?",
                 "answer": "when a model learns training data too well and performs poorly on new data",
                 "explanation": "An overfit model memorizes noise/details in training data instead of general patterns, hurting real-world accuracy."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is RAG (Retrieval-Augmented Generation)?",
                 "answer": "combining a search/retrieval step with an LLM to ground answers in real data",
                 "explanation": "RAG fetches relevant documents/context first, then feeds them to the LLM, reducing hallucination and enabling up-to-date answers."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is a 'token' in the context of LLMs?",
                 "answer": "a chunk of text (word/subword) the model processes as a unit",
                 "explanation": "Models break text into tokens (often sub-word pieces) for processing; pricing and context limits are usually measured in tokens."},
                {"person": "Hyma", "subject": "Certification Courses", "question": "What is 'fine-tuning' an AI model?",
                 "answer": "further training a pre-trained model on a smaller, specific dataset",
                 "explanation": "Fine-tuning adapts a general-purpose model to a specific task or domain without training from scratch."},
            ]
            for q in cert_questions:
                db.add(models.DailyQuestion(**q, difficulty="medium", points=5, date_assigned=None))
            db.commit()
    finally:
        db.close()


_seed_additions()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = uploads.UPLOAD_DIR
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

for module_router in (
    dashboard.router,
    calendar.router,
    chores.router,
    meals.router,
    pantry.router,
    ai_meals.router,
    grocery.router,
    school.router,
    sat_tracker.router,
    spelling_tracker.router,
    shloka_tracker.router,
    health_tracking.router,
    finance.router,
    notes.router,
    ai_assistant.router,
    reports.router,
    family.router,
    uploads.router,
    study.router,
):
    app.include_router(module_router)


@app.get("/health")
def health_check() -> dict:
    """Liveness probe for the API."""
    return {"status": "ok"}
