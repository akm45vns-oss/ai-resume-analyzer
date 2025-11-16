# backend/app/main.py
import os
import uuid
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume-analyzer")

# base dir (safe, works on Render)
BASE_DIR = Path(__file__).parent.resolve()

app = FastAPI(title="AI Resume Analyzer (safe startup)")

# Allow CORS for local dev / frontend (adjust origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Placeholder for heavy ML models / resources
models = {
    "nlp": None,
    "skill_extractor": None,
}


@app.on_event("startup")
async def load_models_on_startup():
    """
    Load heavy models here (once) — wrap in try/except so
    startup errors are logged and won't crash the whole process.
    If a model fails, API still starts and returns 5xx only when that endpoint is used.
    """
    try:
        logger.info("Startup: loading optional heavy models (if available)...")
        # Example: import and load spacy / transformers etc here.
        # Do not download models at import time.
        # Replace with your real loading code, e.g.:
        # import spacy
        # models['nlp'] = spacy.load('en_core_web_sm')
        #
        # For now keep stubs to avoid crash on Render.
        models["nlp"] = None
        models["skill_extractor"] = None
        logger.info("Startup: model load attempted (ok if None).")
    except Exception as e:
        logger.exception("Failed to load models in startup: %s", e)
        # do not raise — keep server running


@app.get("/health")
async def health():
    return {"status": "ok"}


# Render (and many platforms) probe /healthz — add this endpoint too
@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


def extract_text_from_pdf_bytes(data: bytes) -> str:
    """
    Minimal safe text-extraction stub. Replace with your actual PDF parsing
    (fitz / pdfminer) but ensure it raises controlled exceptions.
    """
    try:
        # Prefer PyMuPDF (fitz) if available — otherwise fallback
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=data, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text("text"))
            return "\n".join(text_parts).strip()
        except Exception:
            # fallback: try pdfminer.six (light attempt) — keep it safe
            try:
                from io import BytesIO
                from pdfminer.high_level import extract_text_to_fp

                output = BytesIO()
                extract_text_to_fp(BytesIO(data), output)
                return output.getvalue().decode(errors="ignore").strip()
            except Exception:
                # final fallback: return empty string (safe)
                return ""
    except Exception as e:
        logger.exception("PDF parse error: %s", e)
        raise


@app.post("/analyze-resume")
async def analyze_resume(resume: UploadFile = File(...), job_description: Optional[str] = Form(None)):
    """
    Analyze resume endpoint (multipart). We keep it robust:
    - validate file type
    - try to extract text
    - call your scoring function(s) safely (if present).
    """
    logger.info("Received analyze request: filename=%s, content_type=%s", resume.filename, resume.content_type)
    # validate
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=422, detail="Only PDF files accepted")

    data = await resume.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    # extract text
    try:
        text_snippet = extract_text_from_pdf_bytes(data)
    except Exception as e:
        logger.exception("Failed to extract text from PDF: %s", e)
        raise HTTPException(status_code=500, detail="Failed to extract text from PDF")

    # If your real scoring functions exist, call them here, but guard with try/except
    # e.g. from app.core.scoring import extract_skills_from_text, calculate_scores
    try:
        # stub result: simple length-based score so UI can display something
        length = len(text_snippet or "")
        match_score = min(100, int(length / 10))  # dummy
        breakdown = {"skills": match_score, "format": 100 - match_score}
    except Exception as e:
        logger.exception("Scoring failed: %s", e)
        raise HTTPException(status_code=500, detail="Scoring failed")

    analysis_id = str(uuid.uuid4())
    result = {
        "id": analysis_id,
        "filename": resume.filename,
        "match_score": match_score,
        "breakdown": breakdown,
        "text_snippet": (text_snippet[:2000] if text_snippet else ""),
    }

    logger.info("Analysis complete: id=%s score=%s", analysis_id, match_score)
    return JSONResponse(status_code=200, content=result)
