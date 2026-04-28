from fastapi import APIRouter, Depends, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.ori_client import ori_client
from core.security import get_current_user

router = APIRouter()

# On protège cette route avec Supabase 
@router.post("/", response_model=ChatResponse)
def post_chat(
    request: ChatRequest, 
    user_id: str = Depends(get_current_user)
):
    """
    Envoie un message de chat au Bot ORI.
    Nécessite un token JWT valide d'un utilisateur Supabase.
    """
    try:
        # Appel à Vertex AI via le service enveloppé
        result = ori_client.chat(
            message=request.message,
            thread_id=request.thread_id,
            user_id=user_id
        )
        
        return ChatResponse(
            response=result["response"],
            thread_id=result["thread_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
