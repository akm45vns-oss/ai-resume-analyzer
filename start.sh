#!/bin/sh
echo "===== STARTUP DEBUG: current dir ====="
pwd
echo "===== LIST /app ====="
ls -la /app || true
echo "===== LIST /app (recursive top-level) ====="
ls -la /app | sed -n '1,200p' || true

echo "===== PYTHONPATH ====="
python - <<'PY'
import sys, os
print("sys.path:")
for p in sys.path:
    print(" -", p)
print("\nCWD:", os.getcwd())
try:
    import importlib, pkgutil
    print("\nCan import 'app'? ", end="")
    try:
        m = importlib.import_module("app")
        print("YES ->", getattr(m, '__file__', str(m)))
    except Exception as e:
        print("NO ->", e)
except Exception as e:
    print("Import check error:", e)
PY

echo "===== STARTING UVICORN (app.main:app) ====="
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
