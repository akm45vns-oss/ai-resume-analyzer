# backend/app/main.py
import os
import uuid
import json
import re
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

# PDF text extraction
import fitz  # PyMuPDF

# ---------------------------
# Robust BASE_DIR / PROJECT_ROOT detection
# ---------------------------
# If _file_ is not defined (rare), fall back to cwd.
try:
    BASE_DIR = Path(_file_).resolve().parent   # backend/app
except NameError:
    BASE_DIR = Path.cwd()
PROJECT_ROOT = BASE_DIR.parent  # e.g. backend
ANALYSES_DIR = PROJECT_ROOT / "analyses"
ANALYSES_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------
# App & CORS
# ---------------------------
app = FastAPI(title="AI Resume Analyzer (Dev Backend)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # keep open for local dev; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Utility: extract text from PDF bytes
# ---------------------------
def extract_text_from_pdf_bytes(data: bytes) -> str:
    """
    Extract text from PDF bytes using PyMuPDF (fitz).
    Returns combined text string (empty string if extraction fails).
    """
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        out = []
        for page in doc:
            text = page.get_text("text")
            if text:
                out.append(text)
        return "\n".join(out).strip()
    except Exception as e:
        # log for debug
        print("extract_text_from_pdf_bytes error:", e)
        return ""

# ---------------------------
# Simple skill extraction & scoring logic
# ---------------------------
COMMON_SKILLS = {
    "python", "java", "c++", "c", "sql", "javascript", "html", "css",
    "react", "node", "django", "flask", "pandas", "numpy", "tensorflow",
    "pytorch", "aws", "docker", "kubernetes", "git", "linux", "excel",
    "tableau", "powerbi", "matplotlib", "scikit-learn", "nlp", "ai",
    "machine learning", "ml", "deep learning"
}

def normalize_text(t: str) -> str:
    return t.lower()

def extract_skills_from_text(text: str) -> list:
    t = normalize_text(text)
    found = set()
    for skill in COMMON_SKILLS:
        escaped = re.escape(skill)
        pattern = r"\b" + escaped + r"\b"
        if re.search(pattern, t):
            found.add(skill)
    if "c++" in t:
        found.add("c++")
    return sorted(found)

def parse_job_description(job_desc: Optional[str]) -> list:
    if not job_desc:
        return []
    return extract_skills_from_text(job_desc)

def calculate_scores(extracted_skills: list, jd_skills: list, text_snippet: str) -> dict:
    if not jd_skills:
        skill_score = 50
    else:
        matches = sum(1 for s in jd_skills if s in extracted_skills)
        skill_score = int((matches / len(jd_skills)) * 100)

    exp_score = 50
    if re.search(r"\b(\d+)\s+years?\b", text_snippet, flags=re.IGNORECASE):
        exp_score = 100

    format_score = 100 if text_snippet and len(text_snippet.strip()) > 20 else 0

    title_score = 0
    if re.search(r"\b(engineer|developer|scientist|manager|analyst)\b", text_snippet, flags=re.IGNORECASE):
        title_score = 70

    match_score = int(
        0.5 * skill_score +
        0.2 * exp_score +
        0.2 * title_score +
        0.1 * format_score
    )
    return {
        "match_score": match_score,
        "breakdown": {
            "match_score": match_score,
            "skill_score": skill_score,
            "semantic_score": 0,
            "experience_score": exp_score,
            "title_score": title_score,
            "format_score": format_score,
        }
    }

# ---------------------------
# POST /analyze-resume
# ---------------------------
@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
):
    if not resume:
        raise HTTPException(status_code=422, detail="Field 'resume' is required")

    # Accept common PDF content types
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=422, detail="Only PDF files accepted")

    try:
        data = await resume.read()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read uploaded file")

    text_snippet = extract_text_from_pdf_bytes(data)
    if not text_snippet:
        raise HTTPException(status_code=500, detail="Failed to extract text from PDF")

    extracted_skills = extract_skills_from_text(text_snippet)
    jd_skills = parse_job_description(job_description or "")
    scores = calculate_scores(extracted_skills, jd_skills, text_snippet)

    analysis_id = str(uuid.uuid4())
    result = {
        "id": analysis_id,
        "filename": resume.filename,
        "match_score": scores["match_score"],
        "breakdown": scores["breakdown"],
        "extracted_skills": extracted_skills,
        "job_description_skills": jd_skills,
        "text_snippet": text_snippet[:5000],
    }

    out_path = ANALYSES_DIR / f"{analysis_id}.json"
    try:
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
    except Exception as e:
        # log but still return result
        print("Warning: failed to save analysis file:", e)

    return JSONResponse(status_code=200, content=result)

# ---------------------------
# GET /export-report/{analysis_id}
# ---------------------------
@app.get("/export-report/{analysis_id}")
async def export_report(analysis_id: str):
    path = ANALYSES_DIR / f"{analysis_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Analysis not found")
    return FileResponse(str(path), media_type="application/json", filename=f"{analysis_id}.json")

# ---------------------------
# root
# ---------------------------
@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Resume Analyzer backend running"}