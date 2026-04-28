from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter()

class Profile(BaseModel):
    user_id: str
    name: str
    city: str
    level: str
    interests: List[str]
    strengths: List[str]
    mobility: bool
    target_diploma: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# Base de données en mémoire pour le Hackathon (Mock)
PROFILES_DB: Dict[str, dict] = {}

@router.post("/")
def create_or_update_profile(profile: Profile):
    """Crée ou met à jour un profil en mémoire."""
    profile_dict = profile.model_dump()
    PROFILES_DB[profile.user_id] = profile_dict
    return {"status": "success", "data": profile_dict}

@router.get("/{user_id}")
def get_profile(user_id: str):
    """Récupère un profil s'il existe."""
    if user_id not in PROFILES_DB:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"status": "success", "data": PROFILES_DB[user_id]}
