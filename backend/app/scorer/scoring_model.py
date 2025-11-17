"""
scoring_model.py
Step 2: grammar/spelling + semantic similarity features.

Functions:
- analyze_text_quality(text) -> dict (spelling_count, grammar_count, issues_preview)
- compute_semantic_similarities(parsed_resume, jd_text) -> dict (overall_sim, per_section_sim)
- build_enhanced_features(path_to_resume, jd_text, skill_list) -> combined dict (calls parser)
"""

import os
import re
from functools import lru_cache
from typing import Dict, Any

# sentence-transformers
try:
    from sentence_transformers import SentenceTransformer, util
except Exception as e:
    SentenceTransformer = None
    util = None

# language tool
try:
    import language_tool_python
except Exception:
    language_tool_python = None

# import parser from Step 1
try:
    from app.parser.resume_parser import parse_resume_file
except Exception:
    # fallback import for when running as a script from repo root
    from parser.resume_parser import parse_resume_file

# -------------------------
# Embedding model (cached)
# -------------------------
@lru_cache(maxsize=1)
def get_embed_model():
    if SentenceTransformer is None:
        raise RuntimeError("sentence-transformers not installed. pip install sentence-transformers")
    # model choice: small & fast
    model = SentenceTransformer("all-MiniLM-L6-v2")
    return model

# -------------------------
# LanguageTool instance (cached)
# -------------------------
@lru_cache(maxsize=1)
def get_lang_tool():
    if language_tool_python is None:
        raise RuntimeError("language-tool-python not installed. pip install language-tool-python")
    # default English
    tool = language_tool_python.LanguageTool("en-US")
    return tool

# -------------------------
# Quality checks
# -------------------------
def analyze_text_quality(text: str) -> Dict[str, Any]:
    """
    Uses language_tool_python to compute:
    - total_issues_count
    - spelling_issues_count (approx)
    - grammar_issues_count (approx)
    - top_issue_examples (first 5 matches)
    """
    out = {
        "total_issues_count": 0,
        "spelling_issues_count": 0,
        "grammar_issues_count": 0,
        "issues_preview": []
    }
    if not language_tool_python:
        # return None-like placeholders if lib missing
        return out

    tool = get_lang_tool()
    # language_tool_python.check can be heavy for long docs; we pass short chunks if needed
    # but we'll run on full resume text here (acceptable for average resume sizes)
    try:
        matches = tool.check(text)
    except Exception as e:
        # If LanguageTool fails (e.g., Java missing), return safely
        return out

    out["total_issues_count"] = len(matches)
    # classify issues roughly
    spelling_count = 0
    grammar_count = 0
    preview = []
    for m in matches[:20]:  # small preview
        rid = getattr(m, 'ruleId', '') or getattr(m, 'ruleId', '')
        msg = getattr(m, 'message', '') or getattr(m, 'msg', '')
        replacement = m.replacements if hasattr(m, 'replacements') else []
        context = getattr(m, 'context', None)
        preview.append({
            "ruleId": rid,
            "message": msg,
            "replacements": replacement[:3],
            "offset": getattr(m, 'offset', None),
            "length": getattr(m, 'errorLength', None),
            "context": context
        })
        # very approximate: language_tool labels spelling rules as 'MORFOLOGIK_RULE'
        if 'MORFOLOGIK' in str(rid).upper() or 'SPELL' in str(rid).upper():
            spelling_count += 1
        else:
            grammar_count += 1

    out["spelling_issues_count"] = spelling_count
    out["grammar_issues_count"] = grammar_count
    out["issues_preview"] = preview
    return out

# -------------------------
# Semantic similarity helpers
# -------------------------
def embed_text_chunks(text: str, model) -> Dict[str, Any]:
    """
    Returns embedding vector for text (handles empty text).
    """
    if not text or not text.strip():
        return None
    return model.encode(text, convert_to_tensor=True)

def cosine_similarity_between_embeddings(a, b):
    if a is None or b is None:
        return 0.0
    # util.cos_sim returns tensor - convert to float
    try:
        sim = util.cos_sim(a, b).item()
    except Exception:
        # fallback: attempt numpy dot
        import numpy as np
        a_np = a.cpu().numpy()
        b_np = b.cpu().numpy()
        denom = ( (a_np**2).sum()**0.5 ) * ( (b_np**2).sum()**0.5 )
        if denom == 0:
            sim = 0.0
        else:
            sim = float((a_np @ b_np) / denom)
    # normalize to 0..1
    return (sim + 1.0) / 2.0

def compute_semantic_similarities(parsed_resume: Dict[str, Any], jd_text: str) -> Dict[str, Any]:
    """
    For given parsed_resume (output of parse_resume_file) and jd_text,
    compute:
      - overall_similarity (resume_text vs jd_text)
      - per_section_similarity for relevant sections (experience, skills, projects, summary)
    Returns similarity scores 0..1
    """
    if SentenceTransformer is None:
        return {
            "overall_similarity": 0.0,
            "per_section_similarity": {}
        }

    model = get_embed_model()

    resume_text = parsed_resume.get("text", "")
    jd_text = jd_text or ""

    emb_jd = embed_text_chunks(jd_text, model) if jd_text.strip() else None
    emb_resume = embed_text_chunks(resume_text, model) if resume_text.strip() else None

    overall_sim = cosine_similarity_between_embeddings(emb_resume, emb_jd)

    per_section = {}
    sections = parsed_resume.get("sections", {}) or {}
    for sec in ["experience", "skills", "projects", "summary", "education"]:
        sec_text = sections.get(sec, "")
        if sec_text and jd_text:
            emb_sec = embed_text_chunks(sec_text, model)
            per_section[sec] = round(cosine_similarity_between_embeddings(emb_sec, emb_jd), 4)
        else:
            per_section[sec] = 0.0

    return {
        "overall_similarity": round(overall_sim, 4),
        "per_section_similarity": per_section
    }

# -------------------------
# Combined pipeline entry
# -------------------------
def build_enhanced_features(resume_path: str, jd_text: str = "", skill_list: list = None) -> Dict[str, Any]:
    """
    Top-level: parse resume file (calls parser), then run grammar/spell and semantic similarity.
    Returns combined dict that can be returned by API or fed to scoring model.
    """
    parsed = parse_resume_file(resume_path, skill_list=skill_list or [])
    text = parsed.get("text", "")

    # 1) quality (grammar & spelling)
    quality = analyze_text_quality(text)

    # 2) semantic similarities
    sem = compute_semantic_similarities(parsed, jd_text or "")

    # 3) merge features
    features = parsed.get("features", {})
    features_enhanced = {
        **features,
        "total_grammar_issues": quality.get("total_issues_count"),
        "spelli

