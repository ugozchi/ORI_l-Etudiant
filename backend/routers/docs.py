from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.ori_client import ori_client
from db.supabase import supabase_client

router = APIRouter()

class DocRequest(BaseModel):
    user_id: str
    doc_type: str # "cv", "cover_letter", "parcoursup"
    target_school: Optional[str] = None
    target_program: Optional[str] = None
    additional_info: Optional[str] = None

@router.post("/generate")
def generate_doc(request: DocRequest) -> Dict[str, Any]:
    """Utilise ORI pour générer un document en fonction du profil de l'étudiant."""
    
    # 1. Vérifier si l'utilisateur a un profil complet (Supabase)
    profile_resp = (
        supabase_client.table("profiles")
        .select("*")
        .eq("user_id", request.user_id)
        .limit(1)
        .execute()
    )
    if not profile_resp.data:
        profile_ctx = "Nom: Etudiant; Niveau: Inconnu; Intérêts: Tech"
    else:
        p = profile_resp.data[0]
        interests = ", ".join(p.get("interests", []))
        strengths = ", ".join(p.get("strengths", []))
        
        scores = p.get("scores", {})
        education_list = scores.get("education", [])
        
        edu_str = ""
        if education_list:
            edu_str = " | Parcours académique : " + " ; ".join([f"{e.get('year')} {e.get('school')} ({e.get('degree')})" for e in education_list])
            
        persona = scores.get("persona_summary", "")
        persona_str = f" | Analyse IA du Persona : {persona}" if persona else ""
        
        profile_ctx = (
            f"Nom: {p.get('name')}; "
            f"Niveau actuel: {p.get('level')}; "
            f"Intérêts: {interests}; "
            f"Points forts cognitifs et soft skills: {strengths}"
            f"{edu_str}"
            f"{persona_str}"
        )

    # 2. Formater le prompt pour Vertex AI
    doc_type_mapping = {
        "cv": "une trame de CV structurée (en texte ou markdown) mettant en valeur le parcours et les forces de l'étudiant",
        "cover_letter": "une lettre de motivation percutante, professionnelle et argumentée",
        "parcoursup": "un projet de formation motivé (idéal pour Parcoursup, maximum 1500 caractères)"
    }
    
    doc_desc = doc_type_mapping.get(request.doc_type, "un document académique")
    
    target_info = ""
    if request.target_school:
        target_info += f" pour candidater à {request.target_school}"
    if request.target_program:
        target_info += f" en {request.target_program}"

    extra_info_str = ""
    if request.additional_info:
        extra_info_str = f"\nL'étudiant a également fourni ces directives spécifiques : '{request.additional_info}'. Prends-les absolument en compte.\n"

    prompt = (
        f"Agis comme un Executive Coach Senior (ex-McKinsey/Goldman Sachs) expert en recrutement pour les cursus d'excellence. "
        f"Ta mission est de produire {doc_desc}{target_info} pour ce talent.\n"
        f"\n[PROFIL DU CANDIDAT]\n{profile_ctx}\n"
        f"{extra_info_str}\n"
        f"DIRECTIVES DE RÉDACTION :\n"
        f"- Niveau de langage : Ultra-professionnel, percutant, 'Executive'. Évite les formules creuses. Utilise un vocabulaire orienté impact, résultats, et leadership.\n"
        f"- Profondeur : Ne te contente pas de surface. Connecte intelligemment ses points forts cognitifs et son parcours académique avec les exigences de la formation/école visée.\n"
        f"- Structure de CV : Si c'est un CV, fournis une architecture très détaillée (Titre, Accroche percutante, Expériences avec 'bullet points' orientés résultats, Compétences clés).\n"
        f"- Lettre/Parcoursup : Si c'est une lettre ou un projet motivé, rédige le texte complet avec une introduction accrocheuse (storytelling), un développement sur la synergie entre son profil et l'école, et une conclusion forte.\n\n"
        f"CONTRAINTE TECHNIQUE CRITIQUE :\n"
        f"- Génère UNIQUEMENT du TEXTE BRUT (PLAIN TEXT).\n"
        f"- ZÉRO balises Markdown (aucun astérisque *, aucun dièse #, aucun tiret de formatage automatique, pas de gras, pas d'italique).\n"
        f"- Utilise uniquement des sauts de ligne pour séparer les paragraphes.\n"
        f"- Ne fais JAMAIS d'introduction conversationnelle ('Voici votre document...'). Commence directement par le contenu demandé."
    )

    # 3. Génération via l'agent ORI (Reasoning Engine)
    try:
        from services.ori_client import ori_client
        result = ori_client.chat(
            message=prompt,
            user_id=user_id
        )
        doc_content = result["response"]
        
    except Exception as e:
        print(f"Erreur avec Agent ORI : {e}. Utilisation du fallback.")
        # Fallback ultra-robuste
        school_str = request.target_school if request.target_school else 'votre établissement'
        prog_str = request.target_program if request.target_program else 'votre formation'
        
        doc_content = f"Objet : Candidature pour {prog_str} à {school_str}\n\nMadame, Monsieur,\n\nActuellement en plein développement de mon projet académique, je vous adresse ma candidature..."

    return {
        "status": "success",
        "doc_content": doc_content.strip()
    }
