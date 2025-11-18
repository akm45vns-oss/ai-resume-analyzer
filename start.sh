#!/bin/sh
# start.sh - ensure /app is in PYTHONPATH, debug logs, then start uvicorn

echo "===== STARTUP DEBUG ====="

echo "-> Setting PYTHONPATH"
export PYTHONPATH=/app:$PYTHONPATH
echo "PYTHONPATH = $PYTHONPATH"

echo ""
echo "-> Current working directory:"
pwd

echo ""
echo "-> Listing /app directory:"
ls -la /app || true

echo ""
echo "-> Listing repo root:"
ls -la . || true

echo ""
echo "-> Testing Python import for 'app'"
python << 'EOF'
import sys, importlib
print("sys.path:", sys.path)
try:
    m = importlib.import_module("app")
    print("IMPORT SUCCESS: app module found at:", m.__file__)
except Exception as e:
    print("IMPORT FAILED:", e)
EOF

echo ""
echo "===== STARTING UVICORN (app.main:app) ====="
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
