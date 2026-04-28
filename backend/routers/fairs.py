from fastapi import APIRouter
from typing import List, Dict, Any
from services.matching import score_fair
from datetime import datetime, timedelta

router = APIRouter()

# Données statiques fictives de grande qualité (Seed Data)
MOCK_FAIRS = [
    {
        "id": "f_1",
        "name": "Salon de l'Étudiant de Paris",
        "date": (datetime.now() + timedelta(days=5)).strftime("%d/%m/%Y"),
        "city": "Paris",
        "region": "Île-de-France",
        "address": "Paris Expo Porte de Versailles",
        "topics": ["Généraliste", "Universités", "Grandes Écoles", "International"],
        "target_levels": ["seconde", "première", "terminale", "bac+1", "bac+2", "bac+3+"],
        "schools_count": 450,
        "description": "Le plus grand rassemblement de l'année pour trouver ta voie. Des centaines d'exposants, des conférences métiers et des conseillers d'orientation présents sur place.",
        "image_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_2",
        "name": "Salon des Masters et Mastères Spécialisés",
        "date": (datetime.now() + timedelta(days=12)).strftime("%d/%m/%Y"),
        "city": "Paris",
        "region": "Île-de-France",
        "address": "Paris Event Center, La Villette",
        "topics": ["Management", "Ingénierie", "Masters", "Spécialisation"],
        "target_levels": ["bac+3+", "professionnels"],
        "schools_count": 120,
        "description": "Idéal pour la poursuite d'études après un Bac+3. Rencontre les directeurs de programmes de Grandes Écoles de commerce, d'ingénieurs et universités.",
        "image_url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_3",
        "name": "Salon de l'Étudiant de Lyon",
        "date": (datetime.now() + timedelta(days=20)).strftime("%d/%m/%Y"),
        "city": "Lyon",
        "region": "Auvergne-Rhône-Alpes",
        "address": "Eurexpo Lyon, Chassieu",
        "topics": ["Généraliste", "Sciences", "Lettres", "Commerce"],
        "target_levels": ["première", "terminale", "bac+1", "bac+2"],
        "schools_count": 280,
        "description": "Découvre toutes les offres de formation de la région lyonnaise. BTS, BUT, Licences, Masters, et écoles spécialisées t'y attendent.",
        "image_url": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_4",
        "name": "Salon Arts, Communication et Numérique",
        "date": (datetime.now() + timedelta(days=25)).strftime("%d/%m/%Y"),
        "city": "Paris",
        "region": "Île-de-France",
        "address": "Viparis, Espace Champerret",
        "topics": ["Art", "Informatique", "Design", "Communication", "Jeux Vidéo"],
        "target_levels": ["terminale", "bac+1", "bac+2"],
        "schools_count": 150,
        "description": "Passionné par la création, le web ou la com ? Viens découvrir les métiers du design graphique, de l'UX, du dev et de l'audiovisuel.",
        "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_5",
        "name": "Salon Santé, Paramédical et Social",
        "date": (datetime.now() + timedelta(days=32)).strftime("%d/%m/%Y"),
        "city": "Lille",
        "region": "Hauts-de-France",
        "address": "Lille Grand Palais",
        "topics": ["Santé", "Sciences", "Social", "Sport"],
        "target_levels": ["terminale", "bac+1"],
        "schools_count": 85,
        "description": "Médecine (PASS/LAS), IFSI, kiné, éducation spécialisée... Toutes les filières pour ceux qui veulent prendre soin des autres et se former dans le médical.",
        "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_6",
        "name": "Salon de l'Étudiant de Toulouse",
        "date": (datetime.now() + timedelta(days=40)).strftime("%d/%m/%Y"),
        "city": "Toulouse",
        "region": "Occitanie",
        "address": "MEETT, Parc des Expositions",
        "topics": ["Généraliste", "Aéronautique", "Ingénierie"],
        "target_levels": ["terminale", "bac+1", "bac+2", "bac+3+"],
        "schools_count": 210,
        "description": "Trouve ta formation idéale au cœur du pôle technologique du sud de la France. Forte présence d'écoles d'ingénieurs et d'aéronautique.",
        "image_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_7",
        "name": "Salon de l'Apprentissage et de l'Alternance",
        "date": (datetime.now() + timedelta(days=45)).strftime("%d/%m/%Y"),
        "city": "Nantes",
        "region": "Pays de la Loire",
        "address": "Parc des Expositions de la Beaujoire",
        "topics": ["Alternance", "Métiers", "Entreprises", "Pro"],
        "target_levels": ["bac+1", "bac+2", "bac+3+"],
        "schools_count": 130,
        "description": "Étudie tout en étant rémunéré ! Rencontre des CFA, des écoles, et directement des recruteurs proposant des contrats d'apprentissage.",
        "image_url": "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_8",
        "name": "Salon Grandes Écoles de Commerce & d'Ingénieurs",
        "date": (datetime.now() + timedelta(days=60)).strftime("%d/%m/%Y"),
        "city": "Marseille",
        "region": "Provence-Alpes-Côte d'Azur",
        "address": "Parc Chanot",
        "topics": ["Grandes Écoles", "Commerce", "Ingénierie", "Prépas"],
        "target_levels": ["terminale", "bac+1", "bac+2"],
        "schools_count": 95,
        "description": "Le rendez-vous pour intégrer une formation d'excellence post-bac ou post-prépa. Conférences sur les concours et rencontres avec les étudiants.",
        "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop"
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
