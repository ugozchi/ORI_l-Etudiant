FROM python:3.10-slim

WORKDIR /app

# Ne pas écrire les .pyc, et flushed stdout direct
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run écoute généralement sur la variable $PORT (défaut 8080)
# Railway détecte aussi la variable $PORT
EXPOSE ${PORT:-8000}

# Commande de lancement (par défaut uvicorn)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
