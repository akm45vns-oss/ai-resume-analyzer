#!/bin/sh
# start.sh - ensure correct PYTHONPATH & start uvicorn for backend/main.py
# Repo layout: repo root contains "backend/" directory with FastAPI app.

echo "===== STARTUP DEBUG ====="

echo "-> Setting PYTHONPATH to include /app and /app/backend"
export PYTHONPATH=/app:/app/backend:$PYTHONPATH
echo "PYTHONPATH = $PYTHONPATH"

echo ""
echo "-> Current working directory:"
pwd

echo ""
echo "-> Listing /app directory:"
ls -la /app || true

echo ""
echo "-> Listing /app/backend directory:"
ls -la /app/backend || true

echo ""
echo "-> Testing Python import for 'backend'"
python << 'PY'
import sys, importlib
print("sys.path:", sys.path)
try:
    m = importlib.import_module("backend")
    print("IMPORT SUCCESS: backend module found at:", getattr(m, '__file__', 'unknown'))
except Exception as e:
    print("IMPORT FAILED:", e)
PY

echo ""
echo "===== STARTING UVICORN (backend.main:app) ====="
# start uvicorn pointing to backend.main:app
exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-10000}
