#!/usr/bin/env bash
# Pull latest code, install deps, run DB migrations, build frontend, restart services.
# Usage: ./scripts/deploy.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Pulling latest code"
git pull

echo "==> Backend: installing dependencies"
cd "$REPO_ROOT/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

# alembic upgrade head also runs automatically on app startup (see app/main.py),
# but running it here surfaces migration errors before we restart/build anything.
echo "==> Backend: applying database migrations"
alembic upgrade head
deactivate

echo "==> Frontend: installing dependencies"
cd "$REPO_ROOT/frontend"
npm install --no-fund --no-audit

echo "==> Frontend: building production bundle"
npm run build

echo "==> Restarting services"
if systemctl list-unit-files 2>/dev/null | grep -q morusuhq-backend; then
  sudo systemctl restart morusuhq-backend
  sudo systemctl restart morusuhq-frontend
  echo "    Restarted morusuhq-backend and morusuhq-frontend via systemd."
else
  echo "    No systemd services found (morusuhq-backend/morusuhq-frontend)."
  echo "    Restart the backend/frontend processes manually, e.g.:"
  echo "      cd backend && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"
  echo "      cd frontend && npm run start"
fi

echo "==> Deploy complete"
