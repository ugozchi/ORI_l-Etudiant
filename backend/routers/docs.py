from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.ori_client import ori_client
from routers.profile import PROFILES_DB

router = APIRouter()

class DocRequest(BaseModel):
    user_id: str
    doc_type: str # "cv", "cover_letter", "parcoursup"
    target_school: Optional[str] = None
    target_program: Optional[str] = None

@router.post("/generate")
def generate_doc(request: DocRequest) -> Dict[str, Any]:
    """Utilise ORI pour générer un document en fonction du profil de l'étudiant."""
    
    # 1. Vérifier si l'utilisateur a un profil
    if request.user_id not in PROFILES_DB:
        # Fallback for Hackathon
        profile_ctx = "Nom: Hackathon ORI; Niveau: Inconnu; Intérêts: Tech"
    else:
        p = PROFILES_DB[request.user_id]
        profile_ctx = f"Nom: {p.get('name')}; Niveau: {p.get('level')}; Intérêts: {','.join(p.get('interests', []))}; Points forts: {','.join(p.get('strengths', []))}"

    # 2. Formater le prompt pour Vertex AI
    doc_type_mapping = {
        "cv": "une structure de CV (avec points clés et argumentaire)",
        "cover_letter": "une lettre de motivation percutante",
        "parcoursup": "un projet de formation motivé (Parcoursup)"
    }
    
    doc_desc = doc_type_mapping.get(request.doc_type, "un document académique")
    
    target_info = ""
    if request.target_school:
        target_info += f" pour l'école {request.target_school}"
    if request.target_program:
        target_info += f" en formation {request.target_program}"

    prompt = (
        f"Tu es un expert en orientation et en rédaction académique. "
        f"Génère {doc_desc}{target_info} pour un étudiant ayant ce profil : [{profile_ctx}]. "
        f"Rédige de manière professionnelle, structurée, mais authentique."
    )

    # 3. Appel à Vertex AI (Via ori_client)
    # On n'injecte pas de Thread ID pour un "one-shot" de génération
    result = ori_client.chat(message=prompt)

    return {
        "status": "success",
        "doc_content": result["response"]
    }
