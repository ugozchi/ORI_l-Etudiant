#!/bin/bash

# ==============================================================================
# Script de lancement pour l'application ORI
# Ce script lance à la fois le Backend (FastAPI) et le Frontend (Next.js)
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}===============================================${NC}"
echo -e "${YELLOW}🚀 Démarrage du projet ORI - L'Étudiant 🚀${NC}"
echo -e "${YELLOW}===============================================${NC}\n"

# Fonction appelée quand l'utilisateur fait CTRL+C
cleanup() {
    echo -e "\n${YELLOW}⚠️  Fermeture des serveurs demandée...${NC}"
    # Tue les processus d'arrière plan lancés par ce script
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}✅ Serveurs arrêtés avec succès. À bientôt !${NC}"
    exit
}

# Assigner l'interception de signal au CTRL+C
trap cleanup SIGINT SIGTERM

# 1. Lancement de l'API Backend
echo -e "${BLUE}[1/2] Lancement de l'API Backend (FastAPI)...${NC}"
cd backend
# Activation du venv s'il existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

# Petite pause pour ne pas entremêler les logs instantanément
sleep 2

# 2. Lancement du Frontend
echo -e "${BLUE}[2/2] Lancement de l'Interface Web (Next.js)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}🎉 Les services sont en cours d'exécution !${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "👉 Interface ORI    : ${BLUE}http://localhost:3000${NC}"
echo -e "👉 API Backend      : ${BLUE}http://localhost:8000${NC}"
echo -e "👉 API Docs         : ${BLUE}http://localhost:8000/docs${NC}"
echo -e "${YELLOW}-----------------------------------------------${NC}"
echo -e "${YELLOW}Pour tout arrêter, appuyez sur : CTRL + C${NC}"
echo -e "${YELLOW}===============================================${NC}\n"

# Empêche le script de se fermer et affiche les logs
wait
