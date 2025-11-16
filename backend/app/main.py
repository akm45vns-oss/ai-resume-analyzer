# backend/app/main.py

import os
import uuid
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume-analyzer")

# Base directory
BASE_DIR = Path(__file__).parent.resolve()

# ---------------------- FASTAPI APP ----------------------
app = FastAPI(title="AI Resume Analyzer (safe startup)")

# ---------------------- CORS FIX ----------------------
FRONTEND_ORIGINS = [
    "https://ai-resume-analyzer-1-p09w.onrender.com",  # Your frontend URL
    "https://ai-resume-analyzer-1.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,  # Only allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------- END CORS FIX ----------------------


# Placeholder for models
models = {
    "nlp": None,
    "skill_extractor": None,
}


@app.on_event("startup")
async def load_models_on_startup():
    """Loads models safely during startup."""
    try:
        logger.info("Startup: Attempting to load ML models...")

        # Example:
        # import spacy
        # models["nlp"] = spacy.load("en_core_web_sm")

        models["nlp"] = None
        models["skill_extractor"] = None

        logger.info("Startup: Model load completed (ok if None).")
    except Exception as e:
        logger.exception("Model loading failed: %s", e)


# ---------------------- HEALTH ENDPOINTS ----------------------

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# ---------------------- PDF EXTRACTION ----------------------

def extract_text_from_pdf_bytes(data: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF or fallback."""
    try:
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=data, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text("text") + "\n"
            return text.strip()
        except Exception:
            return ""
    except Exception as e:
        logger.exception("PDF extract error: %s", e)
        raise


# ---------------------- ANALYZE RESUME ----------------------

@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    logger.info("Analyze request: filename=%s", resume.filename)

    # Validate file type
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=422, detail="Only PDF files are allowed")

    data = await resume.read()

    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    # Extract text
    try:
        text_snippet = extract_text_from_pdf_bytes(data)
    except Exception:
        raise HTTPException(status_code=500, detail="PDF extraction failed")

    # Dummy scoring (replace with real ML logic)
    try:
        length = len(text_snippet or "")
        match_score = min(100, int(length / 10))
        breakdown = {"skills": match_score, "format": 100 - match_score}
    except Exception:
        raise HTTPException(status_code=500, detail="Scoring failed")

    # Create response
    analysis_id = str(uuid.uuid4())
    result = {
        "id": analysis_id,
        "filename": resume.filename,
        "match_score": match_score,
        "breakdown": breakdown,
        "text_snippet": text_snippet[:2000] if text_snippet else "",
    }

    logger.info("Analysis complete: id=%s, score=%s", analysis_id, match_score)
    return JSONResponse(status_code=200, content=result)
