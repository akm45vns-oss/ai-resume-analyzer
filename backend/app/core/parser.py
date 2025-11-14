from io import BytesIO
from PyPDF2 import PdfReader
import pdfminer.high_level as pdfmh

def extract_text_from_pdf(raw_bytes: bytes) -> str:
    text = ""
    try:
        reader = PdfReader(BytesIO(raw_bytes))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        if len(text.strip()) > 50:
            return text
    except Exception:
        pass

    try:
        text = pdfmh.extract_text(BytesIO(raw_bytes))
        if text and len(text.strip()) > 0:
            return text
    except Exception:
        pass

    return text or ""
