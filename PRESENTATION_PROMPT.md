# Prompt Générateur de Slides : Pitch ORI - L'Étudiant

*Ce document contient tout le contexte nécessaire pour qu'une IA (Claude, ChatGPT) puisse générer le contenu exact de tes slides de présentation.*

---

## 🛑 INSTRUCTIONS POUR L'IA (À lier dans ton prompt pour Claude)
"Agis comme un expert en Pitch Pitch-Deck pour startups et hackathons. À partir des informations ci-dessous, génère le contenu exact des slides pour une présentation de **8 minutes chronométrées**. 
**CONTRAINTE MAJEURE :** La présentation inclut une démo live de **5 minutes**. Tu ne dois donc générer du texte que pour **3 minutes de prise de parole réelle** (soit environ 4 ou 5 slides maximum très épurées). Les slides doivent être percutantes, visuelles, avec peu de texte (bullet points courts). Indique aussi le 'Speech' (ce que le présentateur doit dire à l'oral pour chaque slide)."

---

## 🧠 CONTEXTE DU PROJET : ORI (L'Étudiant)

**Le Problème :**
L'orientation post-bac et étudiante est anxiogène, générique et archaïque. Les étudiants reçoivent des conseils standardisés qui ne prennent pas en compte leurs réelles capacités cognitives ni leur personnalité profonde. Les salons étudiants sont souvent des labyrinthes où les profils se perdent.

**La Solution : ORI (Orientation Renforcée par l'IA)**
Une plateforme "Executive" premium développée pour *L'Étudiant*. ORI réinvente l'orientation en couplant l'évaluation cognitive et l'IA générative :
1. **L'Alberthon (Gamification) :** L'étudiant passe des mini-jeux chronométrés (Logique, Maths, Comportement) pour générer une empreinte cognitive (Soft & Hard skills).
2. **Le Persona IA :** Un profil psychologique et académique sur-mesure est créé.
3. **Le Générateur de Docs (Executive Coach) :** ORI utilise Gemini 1.5 Flash pour générer des CV, Lettres de motivation et argumentaires Parcoursup ultra-ciblés en croisant le cerveau de l'étudiant et les attentes des écoles d'excellence.
4. **Executive Insights :** Une newsletter ultra-ciblée qui filtre l'actualité selon le parcours visé (Tech, Finance, Entrepreneuriat).

---

## ⏱️ DÉCOUPAGE DU TEMPS (8 Minutes au total)

*   **00:00 - 01:30 (Slides 1 & 2)** : Le constat (Le problème de l'orientation) et la promesse (ORI).
*   **01:30 - 06:30 (DÉMO LIVE)** : Manipulation de la plateforme. *(Aucune slide nécessaire ici, juste une slide de transition "Démo").*
*   **06:30 - 08:00 (Slides 3 & 4)** : La magie sous le capot (Tech Stack) & Le futur (Business / Déploiement).

---

## 🎬 CHORÉGRAPHIE DE LA DÉMO (5 Minutes)
*(Cette section est pour toi, Ugo, pour que tu saches quoi montrer pendant tes 5 minutes de démo).*

1. **L'Onboarding & Alberthon (1 min) :**
   - Montrer l'interface verrouillée ("Locked Overlay") qui oblige à compléter le profil.
   - Montrer rapidement les jeux cognitifs (sans forcément les faire en entier, juste l'interface).
2. **Le Profil & Parcours (1 min) :**
   - Afficher le dashboard de l'étudiant avec ses scores radar.
   - Montrer la *Timeline* du parcours académique (ex: 42, HEC, Mines) avec les badges "Action ORI".
3. **Docs Assistant - LE WOW EFFECT (1.5 min) :**
   - Aller sur l'onglet Docs.
   - Rentrer une école (ex: HEC), un cursus (Finance), et une directive (*"Mets en avant mon stage Google"*).
   - Cliquer sur Générer. Montrer comment l'IA sort instantanément un texte de niveau *Executive Coach* (sur la belle "feuille blanche" de droite).
4. **Newsletter & Chat (1.5 min) :**
   - Montrer l'interface "Executive Insights" (le Dark Mode Premium).
   - Ouvrir un article et montrer l'encart "Conseil d'Alberthon" généré par IA.
   - *(Optionnel)* Poser une question rapide au Chatbot pour clôturer.

---

## ⚙️ LA TECH STACK (Pour la slide technique)
- **Frontend :** Next.js 14 (App Router), React, Tailwind, UI/UX Premium (Glassmorphism).
- **Backend :** Python, FastAPI.
- **Base de données :** Supabase (PostgreSQL & Auth).
- **IA (Le Cerveau) :** Google Cloud Vertex AI (Gemini 1.5 Flash) + Reasoning Engine pour le prompting avancé. L'IA est systématiquement alimentée par le contexte BDD de l'étudiant (RAG basique).
