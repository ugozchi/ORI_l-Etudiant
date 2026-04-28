from fastapi import APIRouter
from typing import List, Dict, Any
from services.matching import score_fair
from datetime import datetime, timedelta

router = APIRouter()

# Données statiques fictives de grande qualité (Seed Data)
MOCK_FAIRS = [
    {
        "id": "f_1",
        "name": "Salon de l'Étudiant Paris",
        "date": (datetime.now() + timedelta(days=15)).strftime("%d/%m/%Y"),
        "city": "Paris",
        "region": "Île-de-France",
        "address": "Paris Expo Porte de Versailles",
        "topics": ["Généraliste", "Universités", "Grandes Écoles", "International"],
        "target_levels": ["terminale", "bac+1", "bac+2", "bac+3+"],
        "schools_count": 350,
        "description": "Le plus grand rassemblement de l'année pour trouver ta voie, avec des centaines d'écoles et d'experts.",
        "image_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_2",
        "name": "Rencontres Ingénierie & Tech",
        "date": (datetime.now() + timedelta(days=5)).strftime("%d/%m/%Y"),
        "city": "Lyon",
        "region": "Auvergne-Rhône-Alpes",
        "address": "Eurexpo Lyon",
        "topics": ["Sciences", "Ingénierie", "Informatique"],
        "target_levels": ["terminale", "bac+2"],
        "schools_count": 80,
        "description": "Destiné aux futurs ingénieurs. Rencontre les meilleures écoles d'ingé et de tech de la région.",
        "image_url": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_3",
        "name": "Village E-sport & Gaming",
        "date": (datetime.now() + timedelta(days=22)).strftime("%d/%m/%Y"),
        "city": "Bordeaux",
        "region": "Nouvelle-Aquitaine",
        "address": "Parc des Expositions de Bordeaux",
        "topics": ["Informatique", "Art", "Jeux Vidéo"],
        "target_levels": ["seconde", "première", "terminale"],
        "schools_count": 25,
        "description": "Passionné par le jeu vidéo ? Viens découvrir les métiers du design, du dev et du management e-sport.",
        "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_4",
        "name": "Forum Santé & Médical",
        "date": (datetime.now() + timedelta(days=8)).strftime("%d/%m/%Y"),
        "city": "Lille",
        "region": "Hauts-de-France",
        "address": "Lille Grand Palais",
        "topics": ["Santé", "Sciences", "Social"],
        "target_levels": ["terminale", "bac+1"],
        "schools_count": 45,
        "description": "PASS, L.A.S, écoles d'infirmiers... Toutes les filières pour ceux qui veulent prendre soin des autres.",
        "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_5",
        "name": "Creative Tech Days",
        "date": (datetime.now() + timedelta(days=30)).strftime("%d/%m/%Y"),
        "city": "Nantes",
        "region": "Pays de la Loire",
        "address": "La Cité des Congrès",
        "topics": ["Art", "Informatique", "Design"],
        "target_levels": ["terminale", "bac+2", "bac+3+"],
        "schools_count": 60,
        "description": "Où l'art rencontre la technologie. Découvrez les écoles d'animation 3D, de développement web et de design graphique.",
        "image_url": "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop"
    }
]

# Un profil mocké pour simuler la personnalisation (comme s'il provenait de la BDD)
MOCK_USER_PROFILE = {
    "name": "Inconnu",
    "city": "Paris",
    "level": "terminale",
    "interests": ["Informatique", "Ingénierie", "Art"]
}

@router.get("/")
def get_all_fairs() -> Dict[str, Any]:
    return {"status": "success", "data": MOCK_FAIRS}

@router.get("/recommended/{user_id}")
def get_recommended_fairs(user_id: str) -> Dict[str, Any]:
    """Retourne les salons scorés par rapport au profil de l'utilisateur."""
    # En situation réelle : profile = db.get_user_profile(user_id)
    profile = MOCK_USER_PROFILE
    
    scored_fairs = []
    for fair in MOCK_FAIRS:
        score = score_fair(profile, fair)
        fair_copy = fair.copy()
        fair_copy["match_score"] = float(score)
        scored_fairs.append(fair_copy)
        
    # Trier par score décoissant
    scored_fairs.sort(key=lambda x: x["match_score"], reverse=True)
    return {"status": "success", "data": scored_fairs}
