"""
backend/app/main.py

FastAPI entrypoint for the AI Resume Analyzer backend.

Endpoints:
- GET /               -> basic health / landing
- POST /analyze_with_jd  -> accept resume file + optional JD text, returns analysis JSON

Notes:
- CORS origins: set env var FRONTEND_URL to your frontend origin (e.g. https://ai-resume-analyzer-1-3kh7.onrender.com)
  If FRONTEND_URL is not set, the code will allow all origins ("*") for easier testing.
"""

import os
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

# import the scoring pipeline (ensure the module path matches your repo layout)
# the scoring_model should expose `build_enhanced_features(resume_path, jd_text, skill_list)`
try:
    from app.scorer.scoring_model import build_enhanced_features
except Exception:
    # fallback: try backend.app.scorer
    try:
        from backend.app.scorer.scoring_model import build_enhanced_features
    except Exception as e:
        # If this import fails on startup, we still create the app but raise on call.
        build_enhanced_features = None
        _import_err = e

app = FastAPI(title="AI Resume Analyzer", version="0.1")

# ---------------------
# CORS configuration
# ---------------------
# Prefer explicit origin via environment variable; fallback to "*" for quick testing.
frontend_url = os.getenv("FRONTEND_URL")  # set this in Render environment settings
if frontend_url:
    allowed_origins = [frontend_url, "http://localhost:5173", "http://localhost:3000"]
else:
    # WARNING: wildcard is permissive. Use only for quick testing.
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------
# Helpers
# ---------------------
def _save_upload_to_temp(file: UploadFile) -> str:
    """
    Save an UploadFile to a temporary file and return the path.
    Caller should remove the file after use.
    """
    # create temporary file in system temp
    suffix = Path(file.filename).suffix or ""
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    with open(tmp_path, "wb") as out_f:
        # stream chunks
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            out_f.write(chunk)
    return tmp_path

# ---------------------
# Routes
# ---------------------
@app.get("/", response_class=PlainTextResponse)
async def root():
    return "AI Resume Analyzer backend is up. See /docs for API."

@app.post("/analyze_with_jd")
async def analyze_with_jd(
    file: UploadFile = File(...),
    jd_text: Optional[str] = Form(None),
):
    """
    Accepts:
      - file: resume file (pdf/docx)
      - jd_text: optional job description text

    Returns:
      JSON with parsed resume, quality, semantic, and features_enhanced (whatever scoring_model returns)
    """
    # ensure scoring function available
    if build_enhanced_features is None:
        # import error details may be in _import_err
        raise HTTPException(status_code=500, detail=f"scoring pipeline not available: {_import_err}")

    tmp_path = None
    try:
        tmp_path = _save_upload_to_temp(file)
        # call scoring pipeline (this may take time - keep logs)
        # build_enhanced_features expects path to resume, jd_text and optional skill_list
        result = build_enhanced_features(tmp_path, jd_text or "", skill_list=[])
        # result should be a serializable dict; if it's not fully serializable, convert here
        return JSONResponse(content=result)
    except HTTPException:
        # re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        # include message for debugging
        raise HTTPException(status_code=500, detail=f"analysis failed: {str(e)}")
    finally:
        # cleanup temp file
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass

# ---------------------
# Optional: simple health endpoint that returns JSON
# ---------------------
@app.get("/health")
async def health():
    return {"status": "ok"}

# ---------------------
# If run directly
# ---------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
