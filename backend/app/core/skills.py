# Lightweight skills extractor (no heavy ML). Good for MVP/testing.
CANONICAL_SKILLS = [
    "Python","Pandas","NumPy","TensorFlow","PyTorch","SQL","AWS","Docker",
    "Kubernetes","Machine Learning","Deep Learning","Scikit-learn","Linux",
    "JavaScript","React","Node.js","Git","CI/CD","Data Analysis"
]

def extract_skills(text: str):
    text_l = (text or "").lower()
    found = []
    for s in CANONICAL_SKILLS:
        if s.lower() in text_l:
            found.append(s)
    return sorted(found)
