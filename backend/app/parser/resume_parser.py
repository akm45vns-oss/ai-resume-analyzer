# backend/app/parser/resume_parser.py
"""
Simple resume parser helper.

Provides:
    parse_resume_file(file_path: str, skill_list: Optional[list] = None) -> dict

This function extracts plain text from PDF or DOCX resume files and returns
a dictionary with at least the `resume_text` key. If a `skill_list` is provided,
it will also return `detected_skills` (the intersection of words/phrases found).

Dependencies:
    - pdfminer.six  (for PDF text extraction)
    - python-docx   (for DOCX extraction)  [optional — only needed if you will parse docx]
"""

import re
from typing import Optional, List, Dict

# pdfminer
try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except Exception:
    pdf_extract_text = None

# docx
try:
    import docx
except Exception:
    docx = None


def _extract_text_from_pdf(path: str) -> str:
    if pdf_extract_text is None:
        return ""
    try:
        text = pdf_extract_text(path)
        return text or ""
    except Exception:
        return ""


def _extract_text_from_docx(path: str) -> str:
    if docx is None:
        return ""
    try:
        doc = docx.Document(path)
        paragraphs = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
        return "\n".join(paragraphs)
    except Exception:
        return ""


def _normalize_text(txt: str) -> str:
    # Basic cleanup: convert multiple whitespace to single space, preserve newlines lightly
    if not txt:
        return ""
    # Replace non-ASCII and weird whitespace
    txt = txt.replace("\r", "\n")
    # collapse many newlines to single newline, then collapse multiple spaces
    txt = re.sub(r"\n\s*\n+", "\n\n", txt)
    txt = re.sub(r"[ \t]+", " ", txt)
    return txt.strip()


def _detect_skills_from_text(txt: str, skill_list: List[str]) -> List[str]:
    """
    Very simple skill detection: case-insensitive search for exact phrases from skill_list.
    Returns skills found (unique, in same order as skill_list).
    """
    if not txt or not skill_list:
        return []

    lowered = txt.lower()
    detected = []
    for skill in skill_list:
        if not skill:
            continue
        phrase = skill.lower().strip()
        # use word boundaries for single words, or substring for multi-word phrases
        # simple check:
        if re.search(r"\b" + re.escape(phrase) + r"\b", lowered):
            detected.append(skill)
        else:
            # fallback: substring match (helps for short phrases)
            if phrase in lowered:
                detected.append(skill)

    return detected


def parse_resume_file(file_path: str, skill_list: Optional[List[str]] = None) -> Dict:
    """
    Parse resume file and return a dictionary.

    Args:
        file_path: path to resume file (pdf or docx or plain text)
        skill_list: optional list of skill strings to look for in the resume

    Returns:
        {
            "resume_text": "...",            # cleaned plain text
            "detected_skills": [...],        # only if skill_list provided
            "source": "pdf" | "docx" | "text" | "unknown"
        }
    """
    text = ""

    # determine extension
    path_lower = file_path.lower()
    source = "unknown"

    try:
        if path_lower.endswith(".pdf"):
            source = "pdf"
            text = _extract_text_from_pdf(file_path)

        elif path_lower.endswith(".docx") or path_lower.endswith(".doc"):
            source = "docx"
            # .doc detection may not be supported by python-docx; fallback to docx only
            text = _extract_text_from_docx(file_path)

        else:
            # try as plain text file
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                source = "text"
            except Exception:
                # final fallback: attempt pdf extraction anyway
                if pdf_extract_text is not None:
                    text = _extract_text_from_pdf(file_path)
                    source = "pdf"
    except Exception:
        # swallow parser errors and keep going with whatever we have
        text = text or ""

    cleaned = _normalize_text(text)

    result = {
        "text": cleaned,
        "resume_text": cleaned,
        "source": source,
        "sections": {},
        "skills": [],
        "features": {}
    }

    # If user supplied skills to check, return detected list
    if skill_list:
        try:
            detected = _detect_skills_from_text(cleaned, skill_list)
        except Exception:
            detected = []
        result["detected_skills"] = detected
        result["skills"] = detected

    return result
