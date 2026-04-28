from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

from routers import auth, chat, fairs, newsletter, profile, passport, docs
app = FastAPI(
    title="ORI API - Hackathon L'Étudiant",
    description="Backend Multiplateforme avec ORI (Vertex AI) et Supabase Auth",
    version="1.0.0"
)

# Configuration CORS pour autoriser le frontend vélcel/local et l'extension Chrome
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://*.vercel.app",  # Adapter à l'url de vercel souhaitée en prod
    "chrome-extension://*",   # Pour l'extension chrome
    # Placer vos vraies urls ici
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # On laisse ouvert à * pour faciliter le hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(auth.router, prefix=f"{settings.api_v1_str}/auth", tags=["Auth"])
app.include_router(chat.router, prefix=f"{settings.api_v1_str}/chat", tags=["Chat"])
app.include_router(fairs.router, prefix=f"{settings.api_v1_str}/fairs", tags=["Fairs"])
app.include_router(newsletter.router, prefix=f"{settings.api_v1_str}/newsletter", tags=["Newsletter"])
app.include_router(profile.router, prefix=f"{settings.api_v1_str}/profile", tags=["Profile"])
app.include_router(passport.router, prefix=f"{settings.api_v1_str}/passport", tags=["Passport"])
app.include_router(docs.router, prefix=f"{settings.api_v1_str}/docs", tags=["Docs"])

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "ori-backend-api"}
