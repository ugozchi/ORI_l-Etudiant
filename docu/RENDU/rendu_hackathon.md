# ORI - Rendu de Projet (L'Étudiant)

## PARTIE 1 : Trois Scénarios Conversationnels

### Scénario 1 : L'élève indécis (Recherche large)
**1. Question initiale de l'étudiant :** 
*"Je suis en Terminale spé Maths et Physique, mais je ne sais pas du tout quoi faire l'année prochaine. J'aime bien les jeux vidéo et comprendre comment les choses fonctionnent."*

**2. Questions de qualification par ORI :**
* ORI : *"C'est un excellent profil pour les sciences ! Pour t'aider à cibler, préfères-tu un cursus long (bac+5, école d'ingénieurs) ou plus court et professionnalisant (BUT, BTS) ?"*
* Étudiant : *"Je préfère un cursus long, mais je veux de la pratique."*
* ORI : *"Entendu. Serais-tu prêt à quitter ta région actuelle, ou souhaites-tu rester proche de chez toi (et si oui, quelle est ta ville) ?"*
* Étudiant : *"Je suis à Paris et je peux bouger partout en France."*

**3. Recommandations fournies :**
ORI génère un "Persona" et propose :
* Une école d'ingénieurs post-bac spécialisée en informatique et création numérique (ex: Epita, Rubika).
* Un diplôme universitaire en mathématiques/informatique appliquées.
* **Invitation à l'action :** ORI suggère de visiter le *Salon de l'Étudiant Paris "Numérique et Ingénierie"* et crée automatiquement un QR Code (Passeport) pour l'événement.

**4. Comparaison des options par l'étudiant :**
L'étudiant utilise l'interface "Tinder-like" (les cartes de Salons et d'écoles) pour "swiper" les choix. Il compare les écoles en demandant à ORI : *"Quelles sont les différences entre Epita et Rubika sur la partie jeux vidéo ?"*. ORI génère un tableau comparatif détaillé des spécialisations de troisième année.

---

### Scénario 2 : L'étudiante en reconversion/réorientation
**1. Question initiale de l'étudiant :** 
*"Je suis en première année de fac de Droit, mais je déteste ça. Je voudrais travailler dans le marketing ou la communication, mais sans perdre de temps."*

**2. Questions de qualification par ORI :**
* ORI : *"Le droit n'est pas fait pour tout le monde, c'est courageux de changer ! As-tu déjà déposé tes notes/bulletins ou ton CV sur ton profil pour que j'analyse tes points forts (ex: aisance à l'oral, rédaction) ?"*
* Étudiante : *(Upload son relevé de notes du bac via la zone Drag&Drop)* *"Voilà."*
* ORI : *"Merci ! Je vois que tu as d'excellentes notes en langues et en histoire. Es-tu intéressée par une rentrée décalée (dès janvier/février) pour ne pas perdre ton année, ou préfères-tu attendre septembre ?"*
* Étudiante : *"Rentrée décalée si possible."*

**3. Recommandations fournies :**
* Écoles de commerce proposant le programme "Fast-Track" ou "Rentrée Décalée" en février.
* BUT Techniques de Commercialisation (TC) ou Information Communication (Info-Com).

**4. Comparaison des options par l'étudiant :**
L'étudiante demande à ORI d'évaluer le taux d'employabilité de ces deux voies. ORI lui suggère d'activer l'alerte "Newsletter" pour les journées portes ouvertes des écoles de commerce de sa ville. Elle sauvegarde l'école A et écarte l'école B.

---

### Scénario 3 : L'étudiant au profil atypique (Upload de CV direct)
**1. Question initiale de l'étudiant :** 
L'étudiant ne pose pas de question mais uploade directement son CV atypique (Bénévole sportif, passionné de mécanique, notes moyennes). Ensuite il demande : *"Quel métier est fait pour moi ?"*

**2. Questions de qualification par ORI :**
* ORI : *"J'ai analysé ton CV ! Ton engagement associatif dans le sport montre un vrai leadership. Souhaites-tu lier ta passion pour la mécanique et le sport, par exemple dans l'industrie du cycle ou de l'automobile sportive ?"*
* Étudiant : *"Oui, surtout la mécanique de précision, mais je ne suis pas un grand fan des longues études théoriques."*

**3. Recommandations fournies :**
* BTS Conception et Réalisation de Systèmes Automatiques (CRSA).
* BTS Maintenance des Véhicules.
* ORI lui crée instantanément son badge "Persona" mettant en avant ses *Soft Skills* (Leadership, Manuel, Esprit d'équipe) pour rassurer les recruteurs/écoles.

**4. Comparaison des options par l'étudiant :**
Il demande à ORI de lui lister les établissements proposant ce BTS en apprentissage. L'étudiant compare ensuite le rythme de l'alternance (2 jours/3 jours vs 1 semaine/1 semaine) et sauvegarde ses favoris dans son espace.

---

## PARTIE 2 : Note Technique (Technical Note)

### 1. Choix des Technologies
Pour construire la plateforme ORI et garantir une expérience utilisateur fluide, performante et intelligente, la stack suivante a été retenue :
* **IA Cognitive : Mistral AI Medium 3**
  Le modèle Mistral Medium 3 a été choisi pour ses capacités exceptionnelles de raisonnement, de compréhension du français (langue maternelle de l'application), et sa rapidité d'exécution. Il permet de générer des réponses empathiques et de structurer l'analyse des bulletins et des profils via du prompt engineering.
* **ORI API (Backend)**
  Un backend central (développé en Python via FastAPI) qui sert de pont de sécurité et de traitement métier. Il orchestre les appels à Mistral AI, gère la base de données (Supabase) pour l'historique des chats, et exécute la logique de matching (système de recommandation des salons).
* **Interface Frontend (React / Next.js & JavaScript Widget)**
  L'interface est conçue avec Next.js et Tailwind CSS pour offrir une charte "Premium". La fonctionnalité d'assistant ORI a été encapsulée sous forme de **JavaScript Widget** intégrable (Chatbot flottant / iFrame de Chat), ce qui permettrait au groupe *L'Étudiant* de l'intégrer facilement sur n'importe quel autre site web de leur écosystème sans modifier le code source profond.

### 2. Décisions Architecturales Clés
1. **Séparation Stricte du Frontend et du Modèle IA (API Gateway) :**
   Le widget JavaScript (ou le front Next.js) ne communique jamais directement avec Mistral AI. Tout transite par l'**ORI API**. Cela sécurise les clés d'API (stockées côté serveur) et permet de filtrer ou modérer les prompts avant de les envoyer au LLM.
2. **State Management de la Conversation :**
   L'historique de chaque session est conservé côté backend. Lorsqu'un utilisateur actualise le widget, son "Contexte Persona" (niveau, intérêts, points forts) est réinjecté systématiquement dans le *System Prompt* de Mistral AI. L'IA a donc toujours l'illusion d'une mémoire continue.
3. **Approche RAG (Retrieval-Augmented Generation) pour les Données d'Orientation :**
   Mistral AI n'invente pas d'écoles. Lorsqu'il recommande un établissement ou un salon (ex: "Salon de l'Étudiant"), l'ORI API injecte dans le prompt une base de données de salons fraîche et réelle via un système RAG, empêchant ainsi les hallucinations.
4. **Design Orienté Composant ("Tinder-like" & Persona) :**
   L'interface abandonne la recherche classique (barre de recherche / liste de liens) au profit d'une expérience "Tinder-like" avec *framer-motion*, qui incite l'étudiant à interagir de façon ludique avec les choix proposés par l'IA.

### 3. Risque Technique Identifié & Solution

**Risque Identifié : Les Hallucinations du LLM et les Conseils "Dangereux"**
Dans le domaine de l'orientation scolaire, l'enjeu est critique : un LLM (comme Mistral) pourrait halluciner des filières inexistantes, inventer de fausses dates pour Parcoursup, ou encore ignorer la localisation de l'étudiant. De plus, une latence prolongée de l'IA (si elle doit lire un long PDF de CV) nuirait drastiquement à l'expérience utilisateur du Widget JavaScript.

**Solution Apportée (Architecture à Double Vitesse & RAG Contrôlé) :**
1. **Contrôle anti-hallucination :** Le système n'utilise Mistral AI que pour le raisonnement et l'interaction conversationnelle (le "liant"). Pour la recommandation pure, l'ORI API force le LLM à s'appuyer **exclusivement** sur une base vectorielle fermée (les données certifiées de *L'Étudiant*). Un *garde-fou* (Guardrail) algorithmique classique vérifie le JSON de sortie du modèle avant de l'envoyer au widget.
2. **Latence perçue (UX) :** Pour l'analyse de documents (comme l'upload d'un bulletin), nous avons découpé le traitement en tâches asynchrones. Le Widget affiche une animation futuriste (Scan IA avec rotation d'éléments 3D) qui masque astucieusement le temps de calcul de l'API. Pendant l'attente, l'étudiant est engagé visuellement, et les données finissent par poper instantanément dans le formulaire de son "Persona".
