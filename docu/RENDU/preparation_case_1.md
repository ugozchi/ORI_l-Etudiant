# Préparation Évaluation "Case #1"

Voici tous les éléments non-techniques (Business & Éthique) dont tu as besoin pour ton évaluation d'aujourd'hui.

## 1. La Note Éthique (À lire et mémoriser pour l'oral)

**Question du jury :** *"Où est-ce qu'ORI s'arrête de prendre des décisions pour l'étudiant, et comment est-ce forcé techniquement ?"*

**Ta réponse :**
> "ORI est un **compagnon d'exploration**, pas un décideur. Techniquement, cela est forcé par notre architecture d'interface (UI). 
> Par exemple, sur le module de Recommandation de Salons, ORI propose une carte, mais c'est toujours l'étudiant qui fait l'action physique de 'Swiper' à droite ou à gauche pour valider ou rejeter l'option. 
> De plus, ORI s'arrête strictement à la mise en relation et à l'information : le système n'a techniquement pas les droits (ni l'API) pour inscrire l'élève sur Parcoursup ou payer l'inscription à une école à sa place. Le contrôle final (le clic de validation) est sanctuarisé du côté de l'utilisateur."

---

## 2. Le Roadmap de Déploiement (V1)

Voici le document de roadmap à présenter au jury (par phases) :

### **Phase 1 : Preuve de Concept (Semaines 1 à 4)** *<- Nous sommes ici*
- **Objectif :** Valider l'UX (Onboarding, Swiper) et l'intégration API sur un scope restreint (10 salons, 50 écoles).
- **Dépendances :** Accès API Vertex AI (Mistral), maquettes validées.

### **Phase 2 : Alpha Test & Intégration RAG (Semaines 5 à 8)**
- **Objectif :** Connecter la vraie base de données de *L'Étudiant* (RAG) pour avoir 100% de vrais salons.
- **Dépendances :** Nettoyage des données internes de *L'Étudiant* (Data Engineering).
- **Risque Identifié :** La base de données interne n'est pas formatée pour l'IA (données textuelles non structurées).
- **Mitigation (Solution) :** Mettre en place un script de vectorisation quotidien (cron job) qui transforme les fiches écoles/salons en format *Embeddings* avant la mise en production.

### **Phase 3 : Beta Publique et Déploiement Widget (Semaines 9 à 12)**
- **Objectif :** Déployer le widget JavaScript sur des pages ciblées du site `letudiant.fr` (ex: articles d'orientation).
- **Dépendances :** Validation de l'équipe Sécurité/RGPD.

---

## 3. Le Modèle ROI (À reproduire dans un fichier Excel/Google Sheets)

Tu dois ouvrir un Google Sheets **maintenant** et y copier ces hypothèses pour montrer que tu as fait l'exercice financier. 

**Colonnes à créer dans Excel :**

| Hypothèse (Nom) | Valeur Actuelle | Valeur Projetée avec ORI | Preuve / Justification |
| :--- | :--- | :--- | :--- |
| **Temps passé sur le site** | 2 min 30 | 5 min 00 | L'interface "Tinder-like" et le Chat engagent l'utilisateur de manière ludique, le forçant à rester pour finir la discussion. |
| **Taux d'inscription aux salons** | 3 % | 7 % | Au lieu de chercher un salon dans une liste infinie, ORI pousse le salon directement pertinent et génère le QR Code en 1 clic. |
| **Génération de Leads (Écoles)** | 1000 / mois | 2500 / mois | Le "Persona" récupère plus de données qualifiées (bulletin, intérêts) que le formulaire classique, rendant le lead plus cher à revendre aux écoles. |

**Test de Sensibilité (Sensitivity Test) à inclure dans ton Excel :**
* *Scénario Pessimiste :* L'augmentation du temps sur le site n'est que de +30 secondes. L'impact sur la conversion des salons reste positif (+1.5%) grâce à la personnalisation du Persona.
* *Scénario Optimiste :* L'engagement double, le taux de conversion salon passe à 10%.

---

## 4. Preuve du "Widget Embeddable" (Technique)

Le jury veut voir le widget tourner sur une page "externe".
J'ai créé un fichier `demo_embed.html` à la racine de ton projet. Tu pourras double-cliquer dessus pour l'ouvrir dans ton navigateur. Il s'agit d'une page HTML complètement blanche (simulant un site externe) qui intègre ton app ORI via un `<iframe>`. Cela prouve que ton architecture est "embeddable".
