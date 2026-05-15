# Full image (not slim) — TensorFlow requires system libs absent in slim.
FROM python:3.11
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# Copy only runtime-needed directories; training data excluded via .dockerignore.
COPY API/ ./API/
COPY model/ ./model/
COPY models/ ./models/
EXPOSE 8001
# Run from /app so `model` package is importable and MODEL_DIR resolves to /app/models.
CMD ["uvicorn", "API.app:app", "--host", "0.0.0.0", "--port", "8001"]
