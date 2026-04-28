from fastapi import APIRouter
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter()

class NewsletterSubscription(BaseModel):
    user_id: str
    email: str
    frequency: str

# Base mock articles
MOCK_ARTICLES = [
    {
        "id": "a_1",
        "title": "Le guide de survie en première année de médecine",
        "summary": "Tout ce qu'il faut savoir sur l'organisation, le mental et les méthodes de travail pour réussir sa L.A.S / PASS.",
        "topic": "Santé",
        "date": "2026-04-20",
        "url": "#",
        "type": "Témoignage",
        "image_url": "https://images.unsplash.com/photo-1576091160550-2173ff9e5fe3?w=500&auto=format&fit=crop"
    },
    {
        "id": "a_2",
        "title": "Intelligence Artificielle : Les métiers qui recrutent",
        "summary": "Découvrez comment l'IA transforme le marché du travail et quelles sont les écoles pour s'y préparer dès maintenant.",
        "topic": "Informatique",
        "date": "2026-04-25",
        "url": "#",
        "type": "Article",
        "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop"
    },
    {
        "id": "a_3",
        "title": "L'Art et le Numérique : Une fusion inédite",
        "summary": "Pourquoi devenir designer 3D ou UI/UX Designer est le choix idéal pour un créatif de nouvelle génération.",
        "topic": "Art",
        "date": "2026-04-22",
        "url": "#",
        "type": "Vidéo",
        "image_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop"
    },
    {
        "id": "a_4",
        "title": "Droit International : Comment construire sa carrière ?",
        "summary": "Les astuces pour intégrer les meilleurs masters et se préparer aux concours prestigieux.",
        "topic": "Droit",
        "date": "2026-04-18",
        "url": "#",
        "type": "Article",
        "image_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop"
    },
    {
        "id": "a_5",
        "title": "Parcoursup 2026 : Le calendrier officiel",
        "summary": "Toutes les dates clés à ne pas manquer pour formuler et valider ses vœux d'orientation.",
        "topic": "Généraliste",
        "date": "2026-03-10",
        "url": "#",
        "type": "Guide",
        "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop"
    },
    {
        "id": "a_6",
        "title": "Trouver son école d'ingénieurs post-bac",
        "summary": "Concours Advance, Geipi Polytech, Avenir... Décryptage des concours pour ne faire aucune erreur.",
        "topic": "Ingénierie",
        "date": "2026-04-21",
        "url": "#",
        "type": "Article",
        "image_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop"
    }
]

# Simuler un profil utilisateur
MOCK_USER_PROFILE = {
    "interests": ["Informatique", "Art", "Généraliste"]
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
    
    return {"status": "success", "data": final_selection[:4]} # Return top 4

@router.post("/subscribe")
def subscribe_newsletter(sub: NewsletterSubscription) -> Dict[str, str]:
    """Mock un endpoint d'inscription à la newsletter."""
    # Dans la vraie vie : db.execute("INSERT INTO subscribers ...")
    return {
        "status": "success",
        "message": f"Utilisateur {sub.email} abonné avec succès ({sub.frequency})."
    }
