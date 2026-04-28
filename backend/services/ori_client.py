import vertexai
from vertexai.preview import reasoning_engines
import uuid
import os
from core.config import settings
from routers.profile import PROFILES_DB
class OriClient:
    _instance = None
    _engine = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OriClient, cls).__new__(cls)
            cls._instance._init_vertex()
        return cls._instance

    def _init_vertex(self):
        """Initialise la connexion à Vertex AI au démarrage"""
        # On s'assure que credential_path pointe vers la racine du repo peu importe le CWD
        if "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
            from pathlib import Path
            root_dir = Path(__file__).resolve().parent.parent.parent
            cred_path = root_dir / "credentials" / "letudiant-data-prod-ori-key.json"
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(cred_path)
            
        print("Initialisation de l'Agent ORI (Mode API)...")
        vertexai.init(
            project=settings.gcp_project_id, 
            location=settings.vertex_location
        )
        self._engine = reasoning_engines.ReasoningEngine(settings.ori_engine_id)

    def chat(self, message: str, thread_id: str = None, user_id: str = None) -> dict:
        """
        Envoie un message au modèle ORI
        Retourne la réponse et l'ID du thread utilisé
        """
        if not thread_id:
            thread_id = str(uuid.uuid4())

        enriched_message = message
        # Si on a un profil pour ce user_id, on l'injecte dans le message
        if user_id and user_id in PROFILES_DB:
            p = PROFILES_DB[user_id]
            interests = ", ".join(p.get("interests", []))
            strengths = ", ".join(p.get("strengths", []))
            context = (
                f"[CONTEXTE PROFIL ÉTUDIANT] "
                f"Prénom: {p.get('name', 'Inconnu')}, "
                f"Ville: {p.get('city', 'Inconnue')}, "
                f"Niveau: {p.get('level', 'Inconnu')}, "
                f"Intérêts: {interests}, "
                f"Points forts: {strengths}. "
                f"[FIN CONTEXTE]\n\n{message}"
            )
            enriched_message = context

        # L'appel à l'API
        response = self._engine.query(
            config={"thread_id": thread_id}, 
            message=enriched_message
        )
        
        text_response = str(response)
        
        # Nettoyage de la réponse
        parts = text_response.split('\x1f')
        if len(parts) == 1:
            parts = text_response.split('␟')

        final_message = text_response
        if len(parts) >= 3 and parts[0] == 'S':
            final_message = parts[1]

        return {
            "response": final_message,
            "thread_id": thread_id
        }

# Instance singleton à importer
ori_client = OriClient()
