from supabase import create_client, Client
from core.config import settings

def get_supabase_client() -> Client:
    """
    Initialise et retourne le client Supabase
    """
    url: str = settings.supabase_url
    key: str = settings.supabase_key
    
    supabase: Client = create_client(url, key)
    return supabase

# Instance globale
supabase_client = get_supabase_client()
