from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # GCP Config
    gcp_project_id: str = "letudiant-data-prod"
    ori_engine_id: str = "7428309353347678208"
    vertex_location: str = "europe-west1"
    
    # Supabase Config
    supabase_url: str
    supabase_key: str
    
    # FastApi Config
    api_v1_str: str = "/api"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
