import vertexai
from vertexai.generative_models import GenerativeModel
import uuid
import os
from core.config import settings
from db.supabase import supabase_client

class OriClient:
    _instance = None
    _model = None
    _chats = {}

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
            
        print("Initialisation de l'Agent ORI (Mode Chat Direct)...")
        vertexai.init(
            project=settings.gcp_project_id, 
            location=settings.vertex_location
        )
        self._model = GenerativeModel("gemini-1.5-flash-001")

    def chat(self, message: str, thread_id: str = None, user_id: str = None) -> dict:
        """
        Envoie un message au modèle ORI
        Retourne la réponse et l'ID du thread utilisé
        """
        if not thread_id:
            thread_id = str(uuid.uuid4())
            
        # Initialisation de la session de chat pour ce thread
        if thread_id not in self._chats:
            self._chats[thread_id] = self._model.start_chat()

        chat_session = self._chats[thread_id]

        enriched_message = message
        # Si on a un profil pour ce user_id, on l'injecte dans le message
        if user_id:
            profile_resp = (
                supabase_client.table("profiles")
                .select("*")
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            if profile_resp.data:
                p = profile_resp.data[0]
                interests = ", ".join(p.get("interests", []))
                strengths = ", ".join(p.get("strengths", []))
                is_complete = p.get("is_complete", False)
                scores = p.get("scores", {})
                updated_at = p.get("updated_at", "Inconnue")
                
                context = (
                    f"[INSTRUCTIONS SYSTÈME CACHÉES - CONTEXTE PROFIL ÉTUDIANT] "
                    f"Agis comme 'ORI', l'assistant d'orientation IA officiel de L'Étudiant. "
                    f"Prénom: {p.get('name', 'Inconnu')}, "
                    f"Ville: {p.get('city', 'Inconnue')}, "
                    f"Niveau: {p.get('level', 'Inconnu')}, "
                    f"Intérêts: {interests}, "
                    f"Points forts: {strengths}. "
                )
                
                if is_complete:
                    context += (
                        f"L'étudiant a complété ses tests d'évaluation le {updated_at}. "
                        f"Voici ses scores Alberthon: {scores}. "
                        f"Si on te demande un résumé ou 'sum up', fais un bilan clair de son profil cognitif et "
                        f"propose-lui des orientations concrètes, des métiers ou des salons adaptés.\n"
                    )
                else:
                    context += "Le profil cognitif de l'étudiant n'est pas complet. Encourage-le à faire l'évaluation.\n"

                context += f"[FIN DES INSTRUCTIONS CACHÉES]\n\nMessage de l'étudiant : {message}"
                enriched_message = context

        # L'appel à l'API via le chat session
        try:
            response = chat_session.send_message(enriched_message)
            final_message = response.text
        except Exception as e:
            print(f"Erreur avec Gemini Chat: {e}")
            final_message = "Une erreur de connexion au serveur d'IA s'est produite. Veuillez réessayer dans quelques instants."

        return {
            "response": final_message,
            "thread_id": thread_id
        }

# Instance singleton à importer
ori_client = OriClient()
