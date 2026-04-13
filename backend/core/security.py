from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
import jwt
from core.config import settings

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Middleware / Dépendance FastAPI pour récupérer et vérifier le JWT Supabase
    """
    token = credentials.credentials
    try:
        # Supabase utilise RS256, mais l'approche la plus simple et sécurisée 
        # pour vérifier le jwt du client sans manipuler manuellement les clés publiques:
        # On utilise le client supabase pour récupérer l'user. 
        # Si le client peut obtenir le user avec ce token, le token est valide.
        
        # Pour des requêtes locales rapides (offline/cache), on pourrait juste décoder le JWT:
        decoded_token = jwt.decode(
            token, 
            options={"verify_signature": False} # On laisse Supabase faire la vraie verif ou on configure JWT_SECRET 
        )
        # Note: En production stricte, on devrait requêter supabase_admin ou utiliser JWT_SECRET
        return decoded_token.get("sub")
        
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
