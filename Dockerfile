# Dockerfile - backend for AI Resume Analyzer (fixed order)
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PORT=10000
WORKDIR /app

# Install system deps (Java needed for language_tool_python)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      default-jre build-essential git wget curl ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the application code (including start.sh)
COPY . /app

# Ensure start.sh is executable
RUN chmod +x /app/start.sh || true

# Set PYTHONPATH so Python can import modules from /app
ENV PYTHONPATH=/app:$PYTHONPATH

# Download spaCy model at build time (optional but speeds first request)
RUN python -m spacy download en_core_web_sm || true

EXPOSE ${PORT}
# Run start.sh which will print debug info then start uvicorn
CMD ["sh", "-c", "/app/start.sh"]
