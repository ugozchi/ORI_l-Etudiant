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

    prompt = (
        f"Tu es un expert en recrutement et en orientation scolaire. "
        f"Ta mission est de rédiger {doc_desc}{target_info} pour un étudiant. "
        f"\n\nVoici le profil très détaillé de l'étudiant, incluant ses formations passées et son analyse cognitive : [{profile_ctx}].\n\n"
        f"Rédige le document final de manière professionnelle, structurée, mais authentique (prête à être copiée-collée). "
        f"N'inclus AUCUN message d'introduction ou de politesse comme 'Voici votre lettre', donne uniquement le contenu du document demandé."
    )

    # 3. Appel à Vertex AI (Via ori_client)
    # On n'injecte pas de Thread ID pour un "one-shot" de génération
    result = ori_client.chat(message=prompt)

    return {
        "status": "success",
        "doc_content": result["response"]
    }
