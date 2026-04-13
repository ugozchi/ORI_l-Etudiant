import vertexai
from vertexai.preview import reasoning_engines
import json
import uuid
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(os.path.dirname(__file__), "credentials", "letudiant-data-prod-ori-key.json")

PROJECT_ID = "letudiant-data-prod"
reasoning_engine_id = "7428309353347678208"

print("Initialisation de l'Agent ORI...")
vertexai.init(project=PROJECT_ID, location="europe-west1")
reasoning_engine = reasoning_engines.ReasoningEngine(reasoning_engine_id)

# On génère un nouvel ID de thread pour chaque session afin de redémarrer à zero
thread_id = str(uuid.uuid4())
print("Prêt ! Vous pouvez commencer à discuter (tapez 'exit' ou 'quit' pour quitter).\n")

while True:
    try:
        user_input = input("\nVous: ")
        
        if user_input.lower() in ['exit', 'quit']:
            print("Au revoir !")
            break
        if not user_input.strip():
            continue
            
        response = reasoning_engine.query(config={"thread_id": thread_id}, message=user_input)
        
        text_response = str(response)
        
        parts = text_response.split('\x1f')
        if len(parts) == 1:
            parts = text_response.split('␟')

        if len(parts) >= 3 and parts[0] == 'S':
            message = parts[1]
            try:
                tokens_info = json.loads(parts[2])
                print(f"\nORI: {message}")
                print(f"\n[🔑 Info Tokens | Input: {tokens_info.get('input_tokens_count', 0)} | Output: {tokens_info.get('output_tokens_count', 0)}]")
            except Exception:
                print(f"\nORI: {message}")
        else:
            print(f"\nORI: {text_response}")

    except KeyboardInterrupt:
        print("\nArrêt forcé.")
        break
    except Exception as e:
        print(f"\nErreur: {e}")