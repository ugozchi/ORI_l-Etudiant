FROM python:latest

WORKDIR /app

RUN pip install google-cloud-aiplatform

ADD . /app

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/letudiant-data-prod-albert-key.json
