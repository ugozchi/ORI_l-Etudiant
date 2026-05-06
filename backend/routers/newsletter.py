from fastapi import APIRouter
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter()

class NewsletterSubscription(BaseModel):
    user_id: str
    email: str
    frequency: str

# Base mock articles pour le persona (HEC / Mines / 42)
MOCK_ARTICLES = [
    {
        "id": "a_1",
        "title": "L'impact de l'IA Générative dans la modélisation financière en 2026",
        "summary": "Comment les Quant Analysts et les Data Scientists réinventent les algorithmes de trading grâce aux nouveaux modèles de langage et à Vertex AI.",
        "topic": "Finance & Tech",
        "date": "2026-05-02",
        "url": "#",
        "type": "Article",
        "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop"
    },
    {
        "id": "a_2",
        "title": "Entrepreneuriat : Comment lever ses premiers fonds après un Master ?",
        "summary": "Les retours d'expérience de 3 alumni HEC Entrepreneurs qui ont levé plus de 5 millions d'euros en Seed l'année dernière.",
        "topic": "Entrepreneuriat",
        "date": "2026-05-05",
        "url": "#",
        "type": "Témoignage",
        "image_url": "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=1200&auto=format&fit=crop"
    },
    {
        "id": "a_3",
        "title": "Les 10 startups européennes de la Data qui recrutent",
        "summary": "Une sélection exclusive des entreprises tech à plus forte croissance cherchant activement des profils ingénieurs et business transverses.",
        "topic": "Carrière",
        "date": "2026-05-01",
        "url": "#",
        "type": "Guide",
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
    },
    {
        "id": "a_4",
        "title": "Masterclass : Stratégies de développement en Python pour la Data",
        "summary": "Les meilleures pratiques d'architecture logicielle pour scaler vos modèles Machine Learning en production. Focus sur l'écosystème 42.",
        "topic": "Code & Architecture",
        "date": "2026-04-28",
        "url": "#",
        "type": "Vidéo",
        "image_url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200&auto=format&fit=crop"
    },
    {
        "id": "a_5",
        "title": "La transition des métiers : De l'ingénierie au leadership",
        "summary": "Comment valoriser son pragmatisme technique pour devenir un leader inspirant au sein d'une organisation tech.",
        "topic": "Soft Skills",
        "date": "2026-04-20",
        "url": "#",
        "type": "Article",
        "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
    },
    {
        "id": "a_6",
        "title": "Le futur du Venture Capital en Europe",
        "summary": "Décryptage des tendances d'investissement pour le prochain semestre. Oubliez la crypto, l'heure est aux CleanTech et à l'IA.",
        "topic": "Analyse Marché",
        "date": "2026-04-15",
        "url": "#",
        "type": "Article",
        "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop"
    }
]

# Simuler un profil utilisateur basé sur Ugo
MOCK_USER_PROFILE = {
    "interests": ["Finance & Tech", "Entrepreneuriat", "Carrière", "Code & Architecture"]
}

@router.get("/preview/{user_id}")
def get_newsletter_preview(user_id: str) -> Dict[str, Any]:
    """Retourne une sélection d'articles scorés par rapport au profil."""
    profile_interests = set(MOCK_USER_PROFILE["interests"])
    
    scored_articles = []
    default_articles = []
    
    for article in MOCK_ARTICLES:
        if article["topic"] in profile_interests:
            scored_articles.append(article)
        else:
            default_articles.append(article)
            
    # Mettre en avant ceux qui matchent le plus, puis compléter
    final_selection = scored_articles + default_articles
    
    return {"status": "success", "data": final_selection} # Return all 6

@router.post("/subscribe")
def subscribe_newsletter(sub: NewsletterSubscription) -> Dict[str, str]:
    """Mock un endpoint d'inscription à la newsletter."""
    # Dans la vraie vie : db.execute("INSERT INTO subscribers ...")
    return {
        "status": "success",
        "message": f"Utilisateur {sub.email} abonné avec succès ({sub.frequency})."
    }
