

# ensure files copied earlier with COPY . /app
RUN chmod +x /app/start.sh || true
ENV PYTHONPATH=/app:$PYTHONPATH
CMD ["sh", "-c", "/app/start.sh"]
