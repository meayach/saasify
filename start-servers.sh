#!/bin/bash

echo "🚀 Démarrage des serveurs avec chemins absolus..."

# Variables des chemins absolus
BACKEND_PATH="/Volumes/DATA/Projet-Saasify-Internship-3/saas-app-backend"
FRONTEND_PATH="/Volumes/DATA/Projet-Saasify-Internship-3/saas-app-frontend"

# Fonction pour tuer les processus existants
cleanup() {
    echo "🧹 Nettoyage des processus existants..."
    pkill -f "nest start" 2>/dev/null || true
    pkill -f "ng serve" 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:4201 | xargs kill -9 2>/dev/null || true
}

# Nettoyage initial
cleanup

echo "📊 Vérification de MongoDB..."
if ! brew services list | grep -q "mongodb-community.*started"; then
    echo "🔄 Démarrage de MongoDB..."
    brew services start mongodb-community
    sleep 3
fi

echo "✅ MongoDB est actif"

echo "🔧 Démarrage du backend NestJS..."
cd "$BACKEND_PATH"
npm run start:dev &
BACKEND_PID=$!

echo "⏳ Attente de 10 secondes pour le backend..."
sleep 10

echo "🎨 Démarrage du frontend Angular..."
cd "$FRONTEND_PATH"
ng serve --port 4201 &
FRONTEND_PID=$!

echo "🎯 Services démarrés:"
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:4201"
echo "   Test URL: http://localhost:4201/applications/configure/68bf71ef4198a0b558e988a8"

echo "📝 PIDs des processus:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"

echo "✨ Pour arrêter les serveurs, utilisez: pkill -f 'nest start' && pkill -f 'ng serve'"

# Garder le script actif
wait
