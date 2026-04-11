# Guide Ultime — Hackathon L'Étudiant × ORI
## Crazy Eight : du sample API au produit complet

---

## 1. Ce qu'on a reçu

Le zip contient un accès à **ORI via Vertex AI Reasoning Engine** sur GCP :

```python
# L'API existante — c'est notre backend IA
import vertexai
from vertexai.preview import reasoning_engines

PROJECT_ID = "letudiant-data-prod"
reasoning_engine_id = "7428309353347678208"

vertexai.init(project=PROJECT_ID, location="europe-west1")
reasoning_engine = reasoning_engines.ReasoningEngine(reasoning_engine_id)

response = reasoning_engine.query(
    config={"thread_id": "1"},
    message="Bonjour"
)
```

**Ce que ça veut dire :** ORI est déjà déployé côté L'Étudiant. On n'a pas à toucher au modèle. On doit construire **l'expérience autour** : profil, UI, salon flow, etc.

---

## 2. Architecture cible

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│         Next.js (React) + Tailwind              │
│   Pages: Chat, Profil, Salons, Newsletter       │
├─────────────────────────────────────────────────┤
│                  BACKEND API                     │
│            FastAPI (Python)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ /chat    │ │ /profile │ │ /fairs           │ │
│  │ (proxy   │ │ (CRUD    │ │ (matching +      │ │
│  │  ORI)    │ │  profil) │ │  QR passport)    │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│       │              │                           │
│       ▼              ▼                           │
│  Vertex AI      Firestore / Supabase            │
│  Reasoning      (profils, feedback,             │
│  Engine         historique)                      │
└─────────────────────────────────────────────────┘
```

**Choix tech recommandés :**
- **Frontend** : Next.js 14 (App Router) + Tailwind + shadcn/ui
- **Backend** : FastAPI (Python) — même langage que le SDK Vertex AI
- **BDD** : Supabase (PostgreSQL managé + auth gratuite) ou Firebase Firestore
- **Auth** : Supabase Auth (email + Google) ou Firebase Auth
- **Déploiement** : Vercel (front) + Cloud Run ou Railway (back)
- **QR Code** : librairie `qrcode` Python ou `qrcode.react` côté front

---

## 3. Plan d'exécution — Ordre des sprints

### SPRINT 0 — Setup (1h)
1. Faire tourner le sample : `docker build . -t albert && docker run albert`
2. Créer le repo GitHub monorepo : `/frontend` + `/backend`
3. Setup FastAPI boilerplate avec endpoint `/health`
4. Setup Next.js avec Tailwind + shadcn/ui
5. Configurer les credentials GCP (service account JSON)
6. Tester que l'appel Vertex AI fonctionne depuis FastAPI

### SPRINT 1 — Chat ORI basique (2h)
1. **Backend** : endpoint `POST /api/chat` qui proxy vers Vertex AI
   - Reçoit `{ message, thread_id }`
   - Appelle `reasoning_engine.query(config={"thread_id": thread_id}, message=message)`
   - Retourne la réponse
2. **Frontend** : page `/chat` avec interface conversationnelle
   - Input message + historique des messages
   - Gestion du `thread_id` (UUID par session)
   - Streaming si supporté, sinon affichage progressif
3. **Test** : conversation complète avec ORI

### SPRINT 2 — Persona / Profil (2h)
1. **BDD** : table `profiles` (user_id, name, city, level, interests[], strengths[], documents_uploaded, created_at)
2. **Backend** :
   - `POST /api/profile` — créer/mettre à jour profil
   - `GET /api/profile/{user_id}` — récupérer profil
   - `POST /api/profile/upload` — upload bulletin scolaire (parsing basique)
3. **Frontend** : page `/profile` avec formulaire multi-étapes
   - Étape 1 : Infos de base (nom, ville, niveau)
   - Étape 2 : Questionnaire intérêts (checkboxes, sliders)
   - Étape 3 : Upload documents (bulletins)
4. **Intégration** : injecter le profil dans le contexte ORI
   - Modifier l'appel chat pour inclure le profil dans le message system/context

### SPRINT 3 — Fair Shotgun + QR Passport (2h)
1. **BDD** : table `fairs` (id, name, date, city, schools[], topics[], location_lat/lng)
2. **Backend** :
   - `GET /api/fairs` — liste des salons
   - `GET /api/fairs/recommended/{user_id}` — salons matchés au profil (scoring simple : ville + intérêts)
   - `POST /api/passport/generate/{user_id}` — génère QR code encodant le profil résumé
3. **Frontend** :
   - Page `/fairs` : cards swipeable (mobile-first), filtrage par profil
   - Composant QR Passport : affichage du QR code personnel
4. **Données** : seed 10-15 salons fictifs réalistes (Paris, Lyon, Bordeaux, etc.)

### SPRINT 4 — Visible Reasoning + Newsletter (1.5h)
1. **Visible Reasoning** :
   - Modifier le prompt ORI pour demander un JSON structuré : `{ answer, reasoning: { signals_detected, profile_factors, sources_used } }`
   - Frontend : panneau latéral ou accordéon montrant le raisonnement
2. **Newsletter** :
   - `POST /api/newsletter/subscribe` — inscription avec préférences
   - `GET /api/newsletter/preview/{user_id}` — preview du contenu personnalisé
   - Seed 20-30 articles fictifs taggés par thème

### SPRINT 5 — Feedback post-salon + Docs Assistant (1.5h)
1. **Feedback** :
   - Page `/feedback` : conversation post-salon avec ORI
   - Backend : stocke le feedback et met à jour le profil
2. **Docs Assistant** :
   - Endpoint `POST /api/docs/generate` — type = cv | cover_letter | parcoursup
   - ORI génère le contenu basé sur le profil
   - Frontend : éditeur simple avec preview

### SPRINT 6 — Freemium + Polish (1h)
1. Feature flags : `is_premium` sur le profil
2. Gating : QR passport, newsletter perso, docs assistant = premium
3. Page `/pricing` avec les deux tiers
4. Polish UI, responsive, démo flow

---

## 4. Structure du code

```
/backend
├── main.py                 # FastAPI app
├── routers/
│   ├── chat.py            # POST /api/chat
│   ├── profile.py         # CRUD profil
│   ├── fairs.py           # Salons + matching
│   ├── passport.py        # QR code generation
│   ├── newsletter.py      # Newsletter preview
│   ├── docs.py            # Docs assistant
│   └── feedback.py        # Feedback post-salon
├── services/
│   ├── ori_client.py      # Wrapper Vertex AI
│   ├── profile_service.py # Logique profil
│   ├── matching.py        # Scoring salon ↔ profil
│   └── qr_generator.py   # QR code
├── models/
│   └── schemas.py         # Pydantic models
├── db.py                  # Connexion Supabase/Firestore
├── credentials/
│   └── .gitkeep
├── Dockerfile
└── requirements.txt

/frontend
├── app/
│   ├── page.tsx           # Landing
│   ├── chat/page.tsx      # Chat ORI
│   ├── profile/page.tsx   # Profil builder
│   ├── fairs/page.tsx     # Shotgun salons
│   ├── passport/page.tsx  # QR passport
│   ├── newsletter/page.tsx
│   ├── feedback/page.tsx
│   ├── docs/page.tsx
│   └── pricing/page.tsx
├── components/
│   ├── ChatMessage.tsx
│   ├── ProfileForm.tsx
│   ├── FairCard.tsx
│   ├── QRPassport.tsx
│   ├── ReasoningPanel.tsx
│   └── layout/
├── lib/
│   ├── api.ts             # Fetch wrapper backend
│   └── types.ts
└── package.json
```

---

## 5. Code clé — Backend ORI Client

```python
# backend/services/ori_client.py
import vertexai
from vertexai.preview import reasoning_engines
import uuid

PROJECT_ID = "letudiant-data-prod"
ENGINE_ID = "7428309353347678208"

vertexai.init(project=PROJECT_ID, location="europe-west1")
engine = reasoning_engines.ReasoningEngine(ENGINE_ID)

def chat_with_ori(message: str, thread_id: str = None, profile_context: dict = None) -> dict:
    """Envoie un message à ORI avec contexte profil optionnel."""
    if not thread_id:
        thread_id = str(uuid.uuid4())

    # Enrichir le message avec le contexte profil
    enriched_message = message
    if profile_context:
        context = (
            f"[CONTEXTE PROFIL ÉTUDIANT] "
            f"Prénom: {profile_context.get('name', 'Inconnu')}, "
            f"Ville: {profile_context.get('city', 'Non précisée')}, "
            f"Niveau: {profile_context.get('level', 'Non précisé')}, "
            f"Intérêts: {', '.join(profile_context.get('interests', []))}, "
            f"Points forts: {', '.join(profile_context.get('strengths', []))}. "
            f"[FIN CONTEXTE]\n\n{message}"
        )
        enriched_message = context

    response = engine.query(
        config={"thread_id": thread_id},
        message=enriched_message
    )
    return {"response": response, "thread_id": thread_id}
```

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, profile, fairs, passport, newsletter, docs, feedback

app = FastAPI(title="ORI API - Hackathon L'Étudiant")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(chat.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(fairs.router, prefix="/api")
app.include_router(passport.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok", "service": "ori-hackathon"}
```

---

## 6. Scoring salon ↔ profil (algorithme simple)

```python
# backend/services/matching.py
def score_fair(profile: dict, fair: dict) -> float:
    """Score 0-100 de pertinence salon pour un profil."""
    score = 0

    # Correspondance ville (40 points)
    if profile.get("city", "").lower() == fair.get("city", "").lower():
        score += 40
    elif profile.get("region", "").lower() == fair.get("region", "").lower():
        score += 20

    # Correspondance thématique (40 points)
    profile_interests = set(profile.get("interests", []))
    fair_topics = set(fair.get("topics", []))
    overlap = profile_interests & fair_topics
    if fair_topics:
        score += int(40 * len(overlap) / len(fair_topics))

    # Correspondance niveau (20 points)
    if profile.get("level") in fair.get("target_levels", []):
        score += 20

    return min(score, 100)
```

---

## 7. Prompts Google Antigravity

Voici les prompts à copier-coller dans l'ordre. Chaque prompt construit sur le précédent.

---

### PROMPT 1 — Setup monorepo + Backend FastAPI + Chat ORI

```
Je construis une app pour un hackathon L'Étudiant. L'objectif est de créer une plateforme d'orientation étudiante autour d'un chatbot IA existant appelé ORI.

CONTEXTE TECHNIQUE :
- ORI est accessible via Vertex AI Reasoning Engine (GCP)
- Project ID : "letudiant-data-prod"
- Engine ID : "7428309353347678208"
- L'appel se fait ainsi :
  import vertexai
  from vertexai.preview import reasoning_engines
  vertexai.init(project="letudiant-data-prod", location="europe-west1")
  engine = reasoning_engines.ReasoningEngine("7428309353347678208")
  response = engine.query(config={"thread_id": "1"}, message="Bonjour")
- Auth via service account JSON dans /credentials/letudiant-data-prod-albert.json
- Variable d'env : GOOGLE_APPLICATION_CREDENTIALS pointe vers ce fichier

CE QUE JE VEUX :
1. Un backend FastAPI (Python) avec :
   - POST /api/chat : reçoit { "message": str, "thread_id": str } et proxy vers Vertex AI. Si thread_id est vide, en générer un UUID. Retourner { "response": str, "thread_id": str }
   - GET /health : retourne { "status": "ok" }
   - CORS ouvert pour le dev
   - requirements.txt avec fastapi, uvicorn, google-cloud-aiplatform, python-dotenv
   - Dockerfile fonctionnel
   - Structure propre avec /routers et /services

2. Un frontend Next.js 14 (App Router) avec :
   - Tailwind CSS + shadcn/ui configurés
   - Page /chat avec une interface de conversation :
     - Liste de messages (user + assistant) avec scroll auto
     - Input en bas avec bouton envoyer
     - Gestion du thread_id stocké en state
     - Appel POST vers http://localhost:8000/api/chat
     - Loading state pendant la réponse
   - Layout avec sidebar : Chat, Profil, Salons (liens vides pour l'instant)
   - Design sombre moderne, police Inter

Génère tout le code, fichier par fichier, prêt à tourner.
```

---

### PROMPT 2 — Profil étudiant (Persona ORI)

```
On continue le projet hackathon L'Étudiant / ORI.

Le backend FastAPI et le frontend Next.js avec le chat fonctionnent.

Maintenant je veux ajouter l'extension "Persona ORI" — un système de profil étudiant.

BACKEND — ajoute :
1. Un modèle Pydantic "Profile" avec : user_id, name, city, level (enum: seconde, première, terminale, bac+1, bac+2, bac+3+), interests (list[str] parmi : sciences, lettres, commerce, santé, droit, informatique, art, ingénierie, social), strengths (list[str]), mobility (bool), target_diploma (str optionnel), created_at, updated_at
2. Stockage en mémoire (dict Python) pour le hackathon — pas de vraie BDD
3. Routes :
   - POST /api/profile : créer/update un profil
   - GET /api/profile/{user_id} : récupérer un profil
4. Modifier POST /api/chat pour accepter un champ optionnel "user_id". Si un profil existe pour ce user_id, injecter le contexte profil dans le message envoyé à ORI sous forme de préambule : "[PROFIL ÉTUDIANT] Prénom: X, Ville: Y, Niveau: Z, Intérêts: A, B, C [FIN PROFIL]"

FRONTEND — ajoute :
1. Page /profile avec un formulaire multi-étapes :
   - Step 1 : Prénom + Ville + Niveau (dropdown)
   - Step 2 : Sélection d'intérêts (grid de chips cliquables avec toggle)
   - Step 3 : Points forts (input tags) + mobilité (switch) + diplôme visé (input)
   - Step 4 : Résumé du profil avec bouton "Sauvegarder"
2. Le user_id est un UUID stocké en localStorage
3. Sur la page /chat, si un profil existe, afficher un badge "Profil actif" et envoyer le user_id avec chaque message
4. Design cohérent avec le reste, animations entre les steps

Génère uniquement les fichiers nouveaux ou modifiés.
```

---

### PROMPT 3 — Fair Shotgun + QR Passport

```
On continue le projet hackathon ORI.

Le chat et le profil fonctionnent. Maintenant j'ajoute les extensions "Fair Shotgun" (salons personnalisés) et "Fair Passport" (QR code).

BACKEND :
1. Seed data : crée une liste de 12 salons fictifs réalistes avec : id, name, date (dates futures), city, region, address, topics (list parmi les mêmes intérêts que le profil), target_levels (list), schools_count (int), description. Exemples : "Salon de l'Étudiant Paris", "Salon Studyrama Lyon", etc.
2. Service de matching : score chaque salon vs le profil (correspondance ville = 40pts, intérêts communs = 40pts, niveau = 20pts). Score 0-100.
3. Routes :
   - GET /api/fairs : tous les salons triés par date
   - GET /api/fairs/recommended/{user_id} : salons triés par score de matching, inclure le score
   - POST /api/passport/{user_id} : génère un QR code (base64 PNG) encodant un JSON résumé du profil (nom, intérêts, niveau). Utiliser la lib `qrcode` Python.
   - GET /api/passport/{user_id} : retourne le QR code en base64 s'il a déjà été généré

FRONTEND :
1. Page /fairs :
   - Si profil existe : afficher les salons recommandés en premier avec leur score (badge pourcentage)
   - Cards de salon : nom, date, ville, nombre d'écoles, topics (tags colorés), score de match
   - Filtre par ville et par thématique
   - Design mobile-first type "swipe cards" (stack de cartes)
2. Page /passport :
   - Affichage du QR code en grand
   - Résumé du profil encodé
   - Bouton "Télécharger mon passport"
   - Explication de comment ça marche au salon

Ajoute `qrcode` et `Pillow` au requirements.txt.
```

---

### PROMPT 4 — Visible Reasoning + Newsletter

```
On continue le projet hackathon ORI.

Chat, profil, salons et QR passport fonctionnent. J'ajoute maintenant "Visible Reasoning" et "Newsletter personnalisée".

VISIBLE REASONING :
1. Backend : modifier le POST /api/chat. Après avoir reçu la réponse d'ORI, faire un second appel (ou parser la réponse) pour extraire le raisonnement. Ajouter dans la réponse un champ "reasoning" : { "signals": ["intérêt pour les sciences", "basé à Lyon"], "sources": ["article: Les métiers de l'ingénierie", "fiche: INSA Lyon"], "confidence": 0.85 }. Pour le hackathon, simuler ce raisonnement en extrayant des mots-clés du message et du profil.
2. Frontend : sur la page /chat, ajouter un bouton "Voir le raisonnement" sous chaque réponse ORI. Au clic, afficher un panneau/drawer avec :
   - "Signaux détectés" : liste de badges
   - "Sources utilisées" : liste de liens
   - "Confiance" : barre de progression
   - Design subtil, pas intrusif

NEWSLETTER :
1. Backend :
   - Seed data : 20 articles fictifs avec { id, title, summary, topic, date, url, type: "article"|"video"|"témoignage" }
   - GET /api/newsletter/preview/{user_id} : retourne les 8 articles les plus pertinents pour le profil (matching par topics)
   - POST /api/newsletter/subscribe : { user_id, email, frequency: "hebdo"|"mensuel" }
2. Frontend : page /newsletter avec :
   - Preview de "ta newsletter de la semaine" : grille de cards articles personnalisées
   - Formulaire d'inscription (email + fréquence)
   - Indication des articles matchés à tes intérêts (highlight des tags communs)
```

---

### PROMPT 5 — Feedback post-salon + Docs Assistant

```
On continue le projet hackathon ORI. Dernières features.

FEEDBACK POST-SALON :
1. Backend :
   - POST /api/feedback : { user_id, fair_id, responses: { visited_schools: [str], surprises: str, disappointments: str, new_interests: [str], overall_rating: 1-5 } }
   - Stocker le feedback et mettre à jour le profil : ajouter new_interests aux intérêts, stocker le feedback dans l'historique
   - GET /api/feedback/{user_id} : historique des feedbacks
2. Frontend : page /feedback
   - Si l'utilisateur a des salons passés, proposer de donner son retour
   - Formulaire conversationnel (pas un form classique) : questions une par une avec animation
   - "Quels stands as-tu visité ?" → input tags
   - "Qu'est-ce qui t'a surpris ?" → textarea
   - "Nouveaux intérêts découverts ?" → chips sélectionnables
   - "Note ton expérience" → stars
   - À la fin, afficher "Ton profil a été mis à jour" avec les changements

DOCS ASSISTANT :
1. Backend :
   - POST /api/docs/generate : { user_id, doc_type: "cv"|"cover_letter"|"parcoursup", target_school: str optionnel, target_program: str optionnel }
   - Utiliser ORI (via Vertex AI) pour générer le contenu en injectant le profil complet + le type de document demandé
   - Retourner le texte généré structuré en sections
2. Frontend : page /docs
   - Sélection du type de document (3 grandes cards)
   - Formulaire : école visée + formation visée
   - Bouton "Générer"
   - Affichage du résultat dans un éditeur stylisé (type lettre)
   - Bouton "Copier" et "Télécharger en PDF"
   - Badge "Premium" sur cette feature
```

---

### PROMPT 6 — Freemium + Landing + Polish final

```
On continue le projet hackathon ORI. Dernière étape : freemium et polish.

FREEMIUM :
1. Backend : ajouter un champ "is_premium" (bool, default false) au profil
2. Middleware : checker si l'utilisateur est premium pour les routes protégées :
   - /api/passport → premium only
   - /api/docs/generate → premium only  
   - /api/newsletter/preview avec contenu complet → premium only (version free = 3 articles seulement)
   - Retourner 403 avec { "error": "premium_required", "feature": "..." }
3. Frontend :
   - Gating UI : quand une feature est premium et l'user est free, afficher un overlay blur avec bouton "Passer à ORI+" au lieu du contenu
   - Page /pricing : deux colonnes Free vs ORI+ avec la liste des features, prix "4.99€/mois" (fictif), bouton "Essayer gratuitement"
   - Toggle dans les settings pour simuler premium (pour la démo)

LANDING PAGE :
- Page d'accueil (/) avec :
  - Hero : "ORI — Ton compagnon d'orientation intelligent" + CTA "Commencer"
  - Section : les 8 features en grille 2x4 (icône + titre + 1 ligne)
  - Section : "Comment ça marche" en 3 étapes (Profil → Explore → Agis)
  - Footer minimal
  - Design impactant, dark, avec accents indigo/violet

POLISH :
- Responsive mobile sur toutes les pages
- Transitions entre les pages (framer-motion ou CSS)
- Loading skeletons partout
- Toast notifications (shadcn toast)
- Favicon + meta tags
```

---

## 8. Tips pour le jour J

1. **Commencer par faire tourner le sample** — si les credentials GCP ne marchent pas, rien ne marche. Tester en premier.
2. **Le backend en dict Python** — pas de BDD pendant le hackathon. Un dict global `profiles = {}` suffit. Ça reset au restart mais on s'en fiche pour la démo.
3. **Faker les données** — seed des salons, articles, et écoles réalistes. La démo est plus impactante avec des vraies villes et vrais noms d'écoles.
4. **Le QR code est la star** — c'est l'extension la plus impressionnante visuellement. Le montrer en live scan pendant la présentation.
5. **Un seul thread_id par user** — lier le thread_id au user_id pour garder la continuité de conversation.
6. **Si ORI est lent** — ajouter un état "ORI réfléchit..." avec une animation. L'UX est plus importante que la vitesse.
7. **Démo flow idéal** : Landing → Créer profil → Chat avec contexte → Voir salons matchés → Générer QR → Montrer feedback → Montrer newsletter → Montrer docs → Pricing.

---

## 9. Variables d'environnement

```env
# Backend (.env)
GOOGLE_APPLICATION_CREDENTIALS=./credentials/letudiant-data-prod-albert.json
GCP_PROJECT_ID=letudiant-data-prod
ORI_ENGINE_ID=7428309353347678208
VERTEX_LOCATION=europe-west1
PORT=8000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 10. Commandes de lancement

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# Docker (backend)
docker build -t ori-backend .
docker run -p 8000:8000 -v $(pwd)/credentials:/app/credentials ori-backend
```
