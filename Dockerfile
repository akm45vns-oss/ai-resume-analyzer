FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PORT=10000
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      default-jre build-essential git wget curl ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

# download spacy model (optional)
RUN python -m spacy download en_core_web_sm || true

EXPOSE ${PORT}
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
