from fastapi import APIRouter, HTTPException, status
from db.supabase import supabase_client
from models.schemas import UserLogin, UserRegister, TokenData

router = APIRouter()

@router.post("/register", response_model=TokenData)
def register(user: UserRegister):
    try:
        response = supabase_client.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        
        if not response.session:
            raise HTTPException(status_code=400, detail="L'inscription a échoué.")
            
        return TokenData(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=response.user.id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=TokenData)
def login(user: UserLogin):
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        
        if not response.session:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")
            
        return TokenData(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=response.user.id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides."
        )
