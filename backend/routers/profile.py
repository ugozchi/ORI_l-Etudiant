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
    # exclude_none=True prevents overwriting defaults like created_at with null
    profile_dict = profile.model_dump(exclude_none=True)
    
    # We update updated_at manually
    from datetime import datetime
    profile_dict["updated_at"] = datetime.now().isoformat()

    try:
        # Full payload (new schema)
        supabase_client.table("profiles").upsert(profile_dict, on_conflict="user_id").execute()
    except Exception as upsert_error:
        try:
            # Robust fallback when upsert/on_conflict is not supported by current schema
            existing = (
                supabase_client.table("profiles")
                .select("user_id")
                .eq("user_id", profile_dict["user_id"])
                .limit(1)
                .execute()
            )
            if existing.data:
                (
                    supabase_client.table("profiles")
                    .update(profile_dict)
                    .eq("user_id", profile_dict["user_id"])
                    .execute()
                )
            else:
                supabase_client.table("profiles").insert(profile_dict).execute()
        except Exception as fallback_error:
            raise HTTPException(
                status_code=500,
                detail=f"Supabase profile save failed. upsert={str(upsert_error)} | fallback={str(fallback_error)}",
            )
    return {"status": "success", "data": profile_dict}

@router.get("/{user_id}")
def get_profile(user_id: str):
    """Récupère un profil s'il existe."""
    try:
        result = (
            supabase_client.table("profiles")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase profile read failed: {str(e)}")
    rows = result.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"status": "success", "data": rows[0]}
