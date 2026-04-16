# ORI - L'Étudiant : Assistant d'Orientation

Bienvenue sur le projet **ORI**, une application d'orientation boostée par IA pour les étudiants. 
Ce projet est un mono-repo (full-stack) contenant une interface utilisateur interactive (Next.js) et une API robuste (FastAPI) connectée au moteur IA Vertex.

---

## 🛠 Prérequis

- **Node.js** (version 18+ recommandée) - [Télécharger](https://nodejs.org/)
- **Python** (version 3.10+ recommandée) - [Télécharger](https://www.python.org/)
- Vos identifiants Google Cloud (`letudiant-data-prod-ori-key.json`) dans le dossier `/credentials/`

## 🚀 Démarrage Rapide (Automatique)

Pour lancer le frontend et le backend avec une seule commande, utilisez notre script d'automatisation. 
Ouvrez un terminal à la racine du projet et tapez :

```bash
# Donnez les droits d'exécution au script (à faire qu'une seule fois)
chmod +x start.sh

# Lancez les deux serveurs
./start.sh
```

Une fois lancé, vos accès sont :
- 🎨 **Interface Web (ORI) :** [http://localhost:3000](http://localhost:3000)
- ⚙️ **API (Documentation & Tester les endpoints) :** [http://localhost:8000/docs](http://localhost:8000/docs)

*(Appuyez sur `CTRL + C` dans le terminal pour arrêter proprement les deux services).*

---

## 💻 Démarrage Manuel

Si vous avez besoin d'intervenir techniquement, ou si vous préférez voir les logs de chaque service séparément, voici comment procéder :

### 1. Backend (L'intelligence et les données)

L'API métier se trouve dans le dossier `backend`. Elle utilise Python, FastAPI et Supabase.

```sh
cd backend

# 1. Activation de l'environnement virtuel
source venv/bin/activate

# 2. Installation des dépendances (facultatif si déjà fait)
pip install -r requirements.txt

# 3. Lancement de l'API avec rechargement automatique
uvicorn main:app --reload
```
Le backend tourne désormais sur **`http://localhost:8000`**.

### 2. Frontend (L'interface visuelle)

Le portail web se trouve dans le dossier `frontend`. Il est construit avec React et l'écosystème Next.js.

Ouvrez un **nouveau terminal**, puis :

```sh
cd frontend

# 1. Installation des paquets NPM (facultatif si déjà fait)
npm install

# 2. Lancement du serveur en mode développeur
npm run dev
```
Le site web tourne désormais sur **`http://localhost:3000`**.

---

## 🐳 Outils Docker et Tests (Historique)

*Archive : Commande historique pour tester une build Docker sur un script isolé.*

```sh
docker build . -t ori
docker run -it --rm ori python index.py 
```