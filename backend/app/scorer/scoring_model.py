"""
scoring_model.py
Robust Step 2: grammar/spelling + semantic similarity features.

This file includes a tolerant import loader so it works across repo layouts:
- app.parser.resume_parser
- backend.app.parser.resume_parser
- backend.parser.resume_parser
- parser.resume_parser

If none found, it raises a clear ImportError with suggestions.
"""

import os
import re
from functools import lru_cache
from typing import Dict, Any

# -------------------------
# Robust import helper
# -------------------------
import importlib
import sys
_from_parser = None
_parser_module_paths_tried = []

def _try_import_parser():
    global _from_parser, _parser_module_paths_tried
    if _from_parser:
        return _from_parser

    # candidate module paths (order matters)
    candidates = [
        "app.parser.resume_parser",
        "backend.app.parser.resume_parser",
        "backend.parser.resume_parser",
        "parser.resume_parser",
    ]

    # also try to add possible roots if needed
    # Ensure '/app' and '/app/backend' available in sys.path (when running in container)
    possible_paths = ["/app", "/app/backend"]
    for p in possible_paths:
        if os.path.isdir(p) and p not in sys.path:
            sys.path.insert(0, p)

    for mod_path in candidates:
        _parser_module_paths_tried.append(mod_path)
        try:
            mod = importlib.import_module(mod_path)
            # expect function parse_resume_file
            if hasattr(mod, "parse_resume_file"):
                _from_parser = mod.parse_resume_file
                return _from_parser
        except Exception:
            # swallow and continue trying other candidates
            continue

    # final attempt: search filesystem for resume_parser.py under /app
    try:
        for root, dirs, files in os.walk("/app"):
            if "resume_parser.py" in files:
                found = os.path.join(root, "resume_parser.py")
                # derive module path by relative path
                rel = os.path.relpath(found, "/app")
                mod_name = rel.replace(os.path.sep, ".").rsplit(".py", 1)[0]
                try:
                    mod = importlib.import_module(mod_name)
                    if hasattr(mod, "parse_resume_file"):
                        _from_parser = mod.parse_resume_file
                        return _from_parser
                except Exception:
                    continue
    except Exception:
        pass

    # nothing found — raise informative error
    raise ImportError(
        "Could not locate parse_resume_file. Tried module paths: "
        + ", ".join(_parser_module_paths_tried)
        + ".\nTip: ensure your resume_parser.py is in one of these packages or "
        "expose parse_resume_file at app/parser/resume_parser.py or backend/app/parser/resume_parser.py"
    )

# attempt to assign parse_resume_file to a callable
try:
    parse_resume_file = _try_import_parser()
except ImportError:
    # Defer raising until runtime import use, but keep the error message available
    parse_resume_file = None
    _parser_import_error = None
    try:
        _parser_import_error = _try_import_parser()
    except Exception as e:
        _parser_import_error = e

# -------------------------
# sentence-transformers & language-tool imports (optional)
# -------------------------
try:
    from sentence_transformers import SentenceTransformer, util
except Exception:
    SentenceTransformer = None
    util = None

try:
    import language_tool_python
except Exception:
    language_tool_python = None

# -------------------------
# Embedding model (cached)
# -------------------------
@lru_cache(maxsize=1)
def get_embed_model():
    if SentenceTransformer is None:
        raise RuntimeError("sentence-transformers not installed. pip install sentence-transformers")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    return model

# -------------------------
# LanguageTool instance (cached)
# -------------------------
@lru_cache(maxsize=1)
def get_lang_tool():
    if language_tool_python is None:
        raise RuntimeError("language-tool-python not installed. pip install language-tool-python")
    tool = language_tool_python.LanguageTool("en-US")
    return tool

# -------------------------
# Quality checks
# -------------------------
def analyze_text_quality(text: str) -> Dict[str, Any]:
    out = {
        "total_issues_count": 0,
        "spelling_issues_count": 0,
        "grammar_issues_count": 0,
        "issues_preview": []
    }
    if language_tool_python is None:
        return out

    tool = get_lang_tool()
    try:
        matches = tool.check(text)
    except Exception:
        return out

    out["total_issues_count"] = len(matches)
    spelling_count = 0
    grammar_count = 0
    preview = []
    for m in matches[:20]:
        rid = getattr(m, 'ruleId', '') or ''
        msg = getattr(m, 'message', '') or ''
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
def embed_text_chunks(text: str, model):
    if not text or not text.strip():
        return None
    return model.encode(text, convert_to_tensor=True)

def cosine_similarity_between_embeddings(a, b):
    if a is None or b is None:
        return 0.0
    try:
        sim = util.cos_sim(a, b).item()
    except Exception:
        import numpy as np
        a_np = a.cpu().numpy()
        b_np = b.cpu().numpy()
        denom = ((a_np**2).sum()**0.5) * ((b_np**2).sum()**0.5)
        if denom == 0:
            sim = 0.0
        else:
            sim = float((a_np @ b_np) / denom)
    return (sim + 1.0) / 2.0

def compute_semantic_similarities(parsed_resume: Dict[str, Any], jd_text: str) -> Dict[str, Any]:
    if SentenceTransformer is None:
        return {"overall_similarity": 0.0, "per_section_similarity": {}}

    model = get_embed_model()
    resume_text = parsed_resume.get("text", "") or ""
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

    return {"overall_similarity": round(overall_sim, 4), "per_section_similarity": per_section}

# -------------------------
# Combined pipeline entry
# -------------------------
def build_enhanced_features(resume_path: str, jd_text: str = "", skill_list: list = None) -> Dict[str, Any]:
    """
    Top-level function that parses resume and computes features.
    """
    # Ensure parser is available
    global parse_resume_file, _parser_import_error
    if parse_resume_file is None:
        # raise clear error (so logs will show)
        raise ImportError(f"parse_resume_file not found. Details: {_parser_import_error}")

    parsed = parse_resume_file(resume_path, skill_list=skill_list or [])
    text = parsed.get("text", "")

    quality = analyze_text_quality(text)
    sem = compute_semantic_similarities(parsed, jd_text or "")

    features = parsed.get("features", {}) or {}
    features_enhanced = {
        **features,
        "total_grammar_issues": quality.get("total_issues_count"),
        "spelling_issues_count": quality.get("spelling_issues_count"),
        "grammar_issues_count": quality.get("grammar_issues_count"),
        "semantic_overall_similarity": sem.get("overall_similarity"),
        "semantic_per_section_similarity": sem.get("per_section_similarity"),
    }

    result = {
        "parsed_resume": parsed,
        "quality": quality,
        "semantic": sem,
        "features_enhanced": features_enhanced
    }
    return result

# -------------------------
# Self-test (when run directly)
# -------------------------
if __name__ == "__main__":
    sample_resume = "sample_resume.pdf"
    sample_jd = "Looking for ML engineer with python, tensorflow, experience in NLP and production systems."
    try:
        # Ensure parse_resume_file exists before running
        if parse_resume_file is None:
            raise ImportError(f"parse_resume_file not found. Details: {_parser_import_error}")
        out = build_enhanced_features(sample_resume, sample_jd, skill_list=["python", "tensorflow", "nlp"])
        import json
        print(json.dumps(out["features_enhanced"], indent=2))
    except Exception as e:
        print("Error (check dependencies or file path):", e)
