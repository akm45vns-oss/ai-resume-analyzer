from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os

# parser & scorer
from app.scorer.scoring_model import build_enhanced_features

app = FastAPI(title="AI Resume Analyzer - Backend")

# allow CORS for local dev frontend (change origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "resume analyzer backend running"}

@app.post("/analyze")
async def analyze_resume(file: UploadFile):
    """
    Backwards-compatible analyze: returns the parsed resume and basic features.
    """
    # save temp file
    suffix = os.path.splitext(file.filename)[1] if file.filename else ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    # minimal skills list (load from data file or update later)
    default_skills = ["python", "tensorflow", "ml", "nlp", "sql", "pytorch"]
    result = build_enhanced_features(temp_path, jd_text="", skill_list=default_skills)

    # cleanup temp file
    try:
        os.remove(temp_path)
    except:
        pass

    return result

@app.post("/analyze_with_jd")
async def analyze_resume_with_jd(file: UploadFile, jd_text: str = Form("")):
    """
    Analyze resume and compute similarity vs provided job description (jd_text).
    Accepts form-data: file and jd_text string.
    """
    suffix = os.path.splitext(file.filename)[1] if file.filename else ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    default_skills = ["python", "tensorflow", "ml", "nlp", "sql", "pytorch"]
    result = build_enhanced_features(temp_path, jd_text=jd_text, skill_list=default_skills)

    try:
        os.remove(temp_path)
    except:
        pass

    return result
