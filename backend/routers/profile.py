from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from db.supabase import supabase_client

router = APIRouter()

class Profile(BaseModel):
    user_id: str
    name: str = ""
    city: str = ""
    level: str = ""
    interests: List[str] = []
    strengths: List[str] = []
    mobility: bool = False
    target_diploma: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    strengths_data: Optional[List[Dict[str, Any]]] = None
    scores: Optional[Dict[str, Any]] = None
    is_complete: Optional[bool] = False
    tests_retake_count: Optional[int] = 0

@router.post("/")
def create_or_update_profile(profile: Profile):
    """Crée ou met à jour un profil dans Supabase."""
    profile_dict = profile.model_dump()
    try:
        # Full payload (new schema)
        supabase_client.table("profiles").upsert(profile_dict, on_conflict="user_id").execute()
    except Exception:
        # Fallback payload (older schema compatibility)
        fallback_payload = {
            "user_id": profile_dict.get("user_id"),
            "name": profile_dict.get("name", ""),
            "city": profile_dict.get("city", ""),
            "level": profile_dict.get("level", ""),
            "interests": profile_dict.get("interests", []),
            "strengths": profile_dict.get("strengths", []),
            "mobility": profile_dict.get("mobility", False),
            "target_diploma": profile_dict.get("target_diploma"),
        }
        supabase_client.table("profiles").upsert(fallback_payload, on_conflict="user_id").execute()
    return {"status": "success", "data": profile_dict}

@router.get("/{user_id}")
def get_profile(user_id: str):
    """Récupère un profil s'il existe."""
    result = (
        supabase_client.table("profiles")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"status": "success", "data": rows[0]}
