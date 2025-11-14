# backend/app/core/scoring.py
from typing import List, Dict, Set
import re

# Basic skill list - expand later or load from file
BASE_SKILLS = {
    "python","java","c","c++","javascript","sql","aws","docker","kubernetes",
    "pandas","numpy","scikit-learn","tensorflow","pytorch","nlp","git","html","css",
    "react","node","fastapi","flask","rest","api","linux","bash"
}

def normalize_text(s: str) -> str:
    return re.sub(r'[^a-z0-9\s\+\#]', ' ', s.lower() or '')

def extract_skills_from_text(text: str, skill_set: Set[str]=None) -> List[str]:
    skill_set = skill_set or BASE_SKILLS
    t = normalize_text(text)
    tokens = set(t.split())
    found = []
    # simple exact match first
    for sk in skill_set:
        if sk in tokens:
            found.append(sk)
    # try multi-word skills (pandas, scikit-learn already single tokens after normalize)
    # Avoid duplicates
    return sorted(set(found))

def parse_job_description(jd: str) -> List[str]:
    if not jd:
        return []
    return extract_skills_from_text(jd)

def calculate_scores(skills: List[str], jd_skills: List[str], text_snippet: str) -> Dict:
    # simple scoring heuristics - tune weights
    # weights:
    W_SKILL = 0.6
    W_EXPERIENCE = 0.25
    W_TITLE = 0.1
    W_FORMAT = 0.05

    # skill score: percent of jd_skills found (if jd provided), else heuristic by # of skills
    if jd_skills:
        matched = len(set(skills) & set(jd_skills))
        skill_score = int((matched / max(1, len(jd_skills))) * 100)
    else:
        # no JD — base on number of extracted skills (capped)
        skill_score = min(100, len(skills) * 12)

    # experience_score heuristic: look for years pattern
    experience_score = 0
    m = re.search(r'(\d+)\s*\+?\s*(years|yrs|year)', text_snippet or '', re.I)
    if m:
        yrs = int(m.group(1))
        experience_score = min(100, yrs * 10)
    else:
        # fallback: presence of words "intern", "experience"
        if re.search(r'\b(experience|internship|intern)\b', text_snippet or '', re.I):
            experience_score = 60
        else:
            experience_score = 0

    # title_score (if JD contains a title word)
    title_score = 0
    if jd_skills:
        # if title appears in snippet (simple)
        if re.search(r'\b(data scientist|machine learning engineer|software engineer|developer)\b', text_snippet or '', re.I):
            title_score = 80
        else:
            title_score = 0

    # format_score: check if text_snippet has typical resume sections
    format_score = 0
    sections = 0
    for w in ['education','experience','projects','skills','contact']:
        if re.search(r'\b'+w+r'\b', text_snippet or '', re.I):
            sections += 1
    format_score = int(min(100, (sections / 5) * 100))

    # semantic_score placeholder (0) — later replace with real embedding similarity
    semantic_score = 0

    # total aggregated score
    total = (W_SKILL * skill_score) + (W_EXPERIENCE * experience_score) + (W_TITLE * title_score) + (W_FORMAT * format_score) + (0.05 * semantic_score)
    total = int(round(total))

    # missing skills:
    missing = sorted(list(set(jd_skills) - set(skills))) if jd_skills else []

    return {
        "match_score": total,
        "breakdown": {
            "skill_score": skill_score,
            "experience_score": experience_score,
            "title_score": title_score,
            "format_score": format_score,
            "semantic_score": semantic_score
        },
        "extracted_skills": sorted(skills),
        "missing_skills": missing
    }
