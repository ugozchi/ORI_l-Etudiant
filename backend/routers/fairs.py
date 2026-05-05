from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from services.matching import score_fair
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid
from db.supabase import supabase_client

router = APIRouter()


class CheckoutRequest(BaseModel):
    user_id: str
    fair_id: str
    quantity: int = 1

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
        "full_description": "Le salon historique de L'Etudiant a Paris avec un parcours visiteur thematique, plus de 450 ecoles, ateliers CV, coaching orientation, et rencontres avec des alumni. Zone internationale, espace alternance et mini-conferences toute la journee.",
        "price_eur": 12.0,
        "spotlight": True,
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
        "full_description": "Un salon premium pour les etudiants en fin de licence ou en reconversion. Focus sur admissions, doubles diplomes, semestre a l'international et financement. Conferences sur employabilite et strategie de candidature.",
        "price_eur": 15.0,
        "spotlight": True,
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
        "full_description": "Le hub de la region AURA pour comparer universites, ecoles et filieres courtes. Programme complet: ateliers orientation, rencontres metiers et stand parcoursup. Ideal pour affiner un projet post-bac.",
        "price_eur": 10.0,
        "spotlight": False,
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
        "full_description": "Un format immersif avec studios de demo, workshops UX/UI, ecoles de jeux video et classes creatives. Rencontres portfolio et masterclass avec des professionnels du secteur numerique et media.",
        "price_eur": 14.0,
        "spotlight": True,
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
        "full_description": "Tout l'ecosysteme sante, paramedical et social dans un meme lieu: ecoles, prepas, instituts et parcours alternatives. Conferences sur numerus apertus, admissions et debouches terrain.",
        "price_eur": 9.0,
        "spotlight": False,
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
        "full_description": "Edition orientee innovation industrielle, aerospatial et robotique. Parcours de visite personnalise selon ton profil avec sessions Q&A ecoles/entreprises et ateliers de projection de carriere.",
        "price_eur": 11.0,
        "spotlight": False,
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
        "full_description": "Le salon reference pour concretiser une alternance rapidement. Espace recrutement en direct, coaching CV express et ateliers pitch avec des entreprises qui recrutent sur place.",
        "price_eur": 8.0,
        "spotlight": True,
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
        "full_description": "Pour viser les concours et admissions selectives, avec simulateurs d'oral, ateliers methodo et retour d'experience d'etudiants admis. Un format orientee strategie et preparation concrete.",
        "price_eur": 16.0,
        "spotlight": True,
        "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_9",
        "name": "Salon Data, IA et Cybersécurité",
        "date": (datetime.now() + timedelta(days=15)).strftime("%d/%m/%Y"),
        "city": "Paris",
        "region": "Île-de-France",
        "address": "Station F, Halle Freyssinet",
        "topics": ["Informatique", "IA", "Cybersécurité", "Data"],
        "target_levels": ["terminale", "bac+1", "bac+2", "bac+3+"],
        "schools_count": 110,
        "description": "Le salon tech le plus attendu pour les passionnes d'IA, de data et de securite.",
        "full_description": "Rencontre des ecoles et entreprises leaders sur IA generative, cloud, cyberdefense et data engineering. Conferenciers experts, challenges live et ateliers orientation vers les metiers tech de demain.",
        "price_eur": 13.0,
        "spotlight": True,
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_10",
        "name": "Forum International Etudes & Mobilité",
        "date": (datetime.now() + timedelta(days=28)).strftime("%d/%m/%Y"),
        "city": "Bordeaux",
        "region": "Nouvelle-Aquitaine",
        "address": "Palais des Congres de Bordeaux",
        "topics": ["International", "Langues", "Universités", "Echanges"],
        "target_levels": ["première", "terminale", "bac+1", "bac+2"],
        "schools_count": 140,
        "description": "Prepare ton projet d'etudes a l'international avec des universites partenaires.",
        "full_description": "Un parcours complet pour les projets internationaux: admissions, visas, bourses, logements et equivalences de diplomes. Espace rencontres avec universites europeennes, nord-americaines et asiatiques.",
        "price_eur": 9.5,
        "spotlight": True,
        "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_11",
        "name": "Salon Sport Business & Management",
        "date": (datetime.now() + timedelta(days=35)).strftime("%d/%m/%Y"),
        "city": "Lyon",
        "region": "Auvergne-Rhône-Alpes",
        "address": "Centre des Congres de Lyon",
        "topics": ["Sport", "Management", "Commerce", "Communication"],
        "target_levels": ["terminale", "bac+1", "bac+2", "bac+3+"],
        "schools_count": 75,
        "description": "Un salon cible sur les carrieres du sport, du marketing et de l'evenementiel.",
        "full_description": "Decouvre les formations pour travailler dans l'industrie du sport: management de clubs, marketing, data performance et evenementiel. Ateliers CV et rencontres avec des pros du secteur.",
        "price_eur": 10.0,
        "spotlight": False,
        "image_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop"
    },
    {
        "id": "f_12",
        "name": "Salon Green Jobs & Transition Écologique",
        "date": (datetime.now() + timedelta(days=52)).strftime("%d/%m/%Y"),
        "city": "Nantes",
        "region": "Pays de la Loire",
        "address": "La Cite des Congres",
        "topics": ["Sciences", "Environnement", "Ingénierie", "Métiers"],
        "target_levels": ["terminale", "bac+1", "bac+2", "bac+3+"],
        "schools_count": 90,
        "description": "Les formations et metiers lies a la transition ecologique et energetique.",
        "full_description": "Salon dedie aux filieres durables: ingenierie environnementale, energies renouvelables, urbanisme resilient et economie circulaire. Conferences metiers et orientation vers des parcours a impact.",
        "price_eur": 8.5,
        "spotlight": False,
        "image_url": "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?w=800&auto=format&fit=crop"
    }
]

FAIR_BY_ID = {fair["id"]: fair for fair in MOCK_FAIRS}

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
    profile = MOCK_USER_PROFILE
    try:
        result = (
            supabase_client.table("profiles")
            .select("name,city,level,interests")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if result.data:
            profile = result.data[0]
    except Exception:
        pass
    
    scored_fairs = []
    for fair in MOCK_FAIRS:
        score = score_fair(profile, fair)
        fair_copy = fair.copy()
        fair_copy["match_score"] = float(score)
        scored_fairs.append(fair_copy)
        
    # Trier par score décoissant
    scored_fairs.sort(key=lambda x: x["match_score"], reverse=True)
    return {"status": "success", "data": scored_fairs}


@router.get("/liked/{user_id}")
def get_liked_fairs(user_id: str) -> Dict[str, Any]:
    response = (
        supabase_client.table("fair_likes")
        .select("fair_id")
        .eq("user_id", user_id)
        .execute()
    )
    liked_ids = {row.get("fair_id") for row in (response.data or [])}
    fairs = [FAIR_BY_ID[fid] for fid in liked_ids if fid in FAIR_BY_ID]
    return {"status": "success", "data": fairs}


@router.post("/liked/{user_id}/{fair_id}")
def like_fair(user_id: str, fair_id: str) -> Dict[str, Any]:
    if fair_id not in FAIR_BY_ID:
        raise HTTPException(status_code=404, detail="Salon introuvable")
    supabase_client.table("fair_likes").upsert(
        {"user_id": user_id, "fair_id": fair_id},
        on_conflict="user_id,fair_id"
    ).execute()
    count_resp = (
        supabase_client.table("fair_likes")
        .select("fair_id")
        .eq("user_id", user_id)
        .execute()
    )
    return {"status": "success", "liked_count": len(count_resp.data or [])}


@router.delete("/liked/{user_id}/{fair_id}")
def unlike_fair(user_id: str, fair_id: str) -> Dict[str, Any]:
    (
        supabase_client.table("fair_likes")
        .delete()
        .eq("user_id", user_id)
        .eq("fair_id", fair_id)
        .execute()
    )
    return {"status": "success"}


@router.get("/tickets/{user_id}")
def get_user_tickets(user_id: str) -> Dict[str, Any]:
    response = (
        supabase_client.table("fair_tickets")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {"status": "success", "data": response.data or []}


@router.post("/tickets/checkout")
def checkout_ticket(request: CheckoutRequest) -> Dict[str, Any]:
    fair = FAIR_BY_ID.get(request.fair_id)
    if not fair:
        raise HTTPException(status_code=404, detail="Salon introuvable")
    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantite invalide")

    ticket = {
        "ticket_id": f"ticket_{uuid.uuid4().hex[:10]}",
        "fair_id": fair["id"],
        "fair_name": fair["name"],
        "date": fair["date"],
        "city": fair["city"],
        "address": fair["address"],
        "quantity": request.quantity,
        "total_price_eur": round(float(fair.get("price_eur", 10.0)) * request.quantity, 2),
        "created_at": datetime.now().isoformat(),
        "status": "paid",
    }
    supabase_client.table("fair_tickets").insert(
        {
            "ticket_id": ticket["ticket_id"],
            "user_id": request.user_id,
            "fair_id": ticket["fair_id"],
            "fair_name": ticket["fair_name"],
            "date": ticket["date"],
            "city": ticket["city"],
            "address": ticket["address"],
            "quantity": ticket["quantity"],
            "total_price_eur": ticket["total_price_eur"],
            "status": ticket["status"],
        }
    ).execute()
    return {"status": "success", "data": ticket}
