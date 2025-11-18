#!/bin/sh
# debug + ensure /app on PYTHONPATH, then start uvicorn

echo "===== Startup - setting PYTHONPATH ====="
export PYTHONPATH=/app:$PYTHONPATH
echo "PYTHONPATH=$PYTHONPATH"
echo "CWD: $(pwd)"
echo "Listing /app:"
ls -la /app || true
echo "Listing repo root:"
ls -la . || true

echo "Starting uvicorn app.main:app on port ${PORT:-10000}"
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}

