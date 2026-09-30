# MorusuHQ

Family Operating System — a unified home base for the Morusu family covering calendar, chores, meals, school tracking, health, finances, and more.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, Alembic
- **Database**: PostgreSQL
- **Infra**: Docker / Docker Compose

## Project Structure

```
MorusuHQ/
├── frontend/          # Next.js 15 app (TypeScript, Tailwind, shadcn/ui)
├── backend/           # FastAPI app (routers per module, SQLAlchemy models)
└── docker-compose.yml # Postgres + backend + frontend for local dev
```

## Core Modules

Dashboard · Calendar (Google Calendar Sync) · Chores & Rewards · Meals & Recipes ·
Pantry & Fridge Inventory · AI Meal Intelligence · Grocery Management · School Tracking ·
SAT Tracker · Spelling Tracker · Shloka Tracker · Health Tracking · Finance Center ·
Notes · AI Assistant · Monthly Reports

## Getting Started

### 1. Run everything with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (docs at `/docs`)
- Postgres: localhost:5432 (`morusuhq` / `morusuhq`)

### 2. Local development (without Docker)

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Database Migrations

Schema changes are managed with **Alembic** (`backend/alembic/`) instead of hand-written `ALTER TABLE` commands, so upgrading to a newer version of the app never wipes or breaks existing data.

- The backend runs `alembic upgrade head` automatically on startup (see `app/main.py`) — any migrations not yet applied to the current database are applied in order, and nothing already applied is re-run.
- A baseline migration (`backend/alembic/versions/b75035dc1cea_baseline_schema.py`) captures the full schema as of the initial release. On a brand-new/empty database, `alembic upgrade head` creates every table from scratch; on an existing database, it only applies what's missing.

**When you change a model** (`backend/app/models/__init__.py`):

```bash
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "describe the change"
```

Review the generated file in `backend/alembic/versions/`, then commit it to git together with the model change. The migration ships with the release and applies itself automatically the next time the app starts — no manual DB surgery needed on any machine (dev laptop, Raspberry Pi, or a fresh install).

## Deploying / Updating (e.g. Raspberry Pi)

Once the code + `.env` are set up on the target machine, future updates are a single command:

```bash
./scripts/deploy.sh
```

This pulls the latest code, installs backend/frontend dependencies, runs `alembic upgrade head` to bring the database schema up to date (preserving existing data), rebuilds the frontend for production, and restarts the `morusuhq-backend`/`morusuhq-frontend` systemd services if present (otherwise it prints the manual restart commands).

## Target Devices

Wall-mounted touchscreen · Tablets · Phones · ChromeOS · Linux (future)
