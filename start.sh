#!/bin/sh
# start.sh - ensure correct PYTHONPATH & start uvicorn for backend.app.main:app
# This script adds /app and /app/backend to PYTHONPATH and starts uvicorn with the proper module path.

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
echo "-> Listing /app/backend/app directory (where FastAPI likely lives):"
ls -la /app/backend/app || true

echo ""
echo "-> Testing Python import for 'backend.app'"
python << 'PY'
import sys, importlib
print("sys.path:", sys.path)
try:
    m = importlib.import_module("backend.app")
    print("IMPORT SUCCESS: backend.app module found at:", getattr(m, '__file__', 'unknown'))
except Exception as e:
    print("IMPORT FAILED:", e)
PY

echo ""
echo "===== STARTING UVICORN (backend.app.main:app) ====="
# Start uvicorn pointing to backend.app.main:app
exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-10000}
