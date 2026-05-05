from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False
    )

    # GCP Config
    gcp_project_id: str = Field(default="letudiant-data-prod", alias="GCP_PROJECT_ID")
    ori_engine_id: str = Field(default="7428309353347678208", alias="ORI_ENGINE_ID")
    vertex_location: str = Field(default="europe-west1", alias="VERTEX_LOCATION")
    
    # Supabase Config
    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_key: str = Field(alias="SUPABASE_KEY")
    
    # FastApi Config
    api_v1_str: str = "/api"
    port: int = 8000

settings = Settings()
