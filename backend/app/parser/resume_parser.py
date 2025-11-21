
import pdfminer.high_level
import re

def parse_resume_file(file_path: str) -> dict:
    """
    Extracts raw text from PDF or DOCX and returns a dict with key resume_text.
    """

    text = ""

    if file_path.lower().endswith(".pdf"):
        try:
            text = pdfminer.high_level.extract_text(file_path)
        except:
            text = ""

    elif file_path.lower().endswith(".docx"):
        try:
            import docx
            doc = docx.Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs])
        except:
            text = ""

    # fallback
    if not text:
        try:
            with open(file_path, "r", errors="ignore") as f:
                text = f.read()
        except:
            text = ""

    # Clean text
    cleaned_text = re.sub(r'\s+', ' ', text).strip()

    return {
        "resume_text": cleaned_text
    }
