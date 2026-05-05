from supabase import create_client, Client
from core.config import settings

def get_supabase_client() -> Client:
    """
    Initialise et retourne le client Supabase
    """
    url: str = settings.supabase_url.strip()
    key: str = settings.supabase_key.strip()

    if not url.startswith("http"):
        raise ValueError(f"SUPABASE_URL invalide: {url}")
    
    supabase: Client = create_client(url, key)
    return supabase

# Instance globale
supabase_client = get_supabase_client()
