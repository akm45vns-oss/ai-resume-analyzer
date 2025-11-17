# Dockerfile - backend for AI Resume Analyzer
# Uses python slim image, installs default-jre for LanguageTool, installs deps,
# downloads spacy model and prepares the app to run via uvicorn.

FROM python:3.11-slim

# Prevent interactive frontend during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# set a default PORT env var for uvicorn (Render will override)
ENV PORT=10000
WORKDIR /app

# Install system deps (Java needed for language_tool_python)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      default-jre build-essential git wget curl ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps (use --no-cache-dir to reduce image size)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code
COPY . /app

# Download small spacy model at build time (so first request is faster)
# If you don't have spacy in requirements, this will fail — ensure it's present
RUN python -m spacy download en_core_web_sm || true

# Expose port (for documentation; Render uses PORT env)
EXPOSE ${PORT}

# Use a shell form to let the $PORT env var expand
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
