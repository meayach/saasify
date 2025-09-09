#!/bin/bash

# Script pour démarrer le projet SaaS avec chemins absolus
echo "🚀 Démarrage du projet SaaS..."

# Chemins absolus
BACKEND_PATH="/Volumes/DATA/Projet-Saasify-Internship-3/saas-app-backend"
FRONTEND_PATH="/Volumes/DATA/Projet-Saasify-Internship-3/saas-app-frontend"

# Fonction pour vérifier si MongoDB fonctionne
check_mongodb() {
    echo "🔍 Vérification de MongoDB..."
    if brew services list | grep -q "mongodb-community.*started"; then
        echo "✅ MongoDB est en cours d'exécution"
    else
        echo "❌ MongoDB n'est pas en cours d'exécution"
        echo "🔄 Démarrage de MongoDB..."
        brew services start mongodb-community
        sleep 3
    fi
}

# Fonction pour démarrer le backend
start_backend() {
    echo "🔧 Démarrage du backend NestJS..."
    cd "$BACKEND_PATH"
    echo "📁 Répertoire backend: $(pwd)"
    
    # Vérifier que le package.json existe
    if [ ! -f "package.json" ]; then
        echo "❌ package.json non trouvé dans $BACKEND_PATH"
        exit 1
    fi
    
    # Démarrer le backend en arrière-plan
    npm run start:dev &
    BACKEND_PID=$!
    echo "🎯 Backend démarré avec PID: $BACKEND_PID"
    
    # Attendre que le backend soit prêt
    echo "⏳ Attente du démarrage du backend..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/api/v1/ > /dev/null 2>&1; then
            echo "✅ Backend prêt sur http://localhost:3001"
            break
        fi
        sleep 2
        echo "⏳ Tentative $i/30..."
    done
}

# Fonction pour démarrer le frontend
start_frontend() {
    echo "🎨 Démarrage du frontend Angular..."
    cd "$FRONTEND_PATH"
    echo "📁 Répertoire frontend: $(pwd)"
    
    # Vérifier que le package.json existe
    if [ ! -f "package.json" ]; then
        echo "❌ package.json non trouvé dans $FRONTEND_PATH"
        exit 1
    fi
    
    # Démarrer le frontend
    ng serve --port 4201 &
    FRONTEND_PID=$!
    echo "🎯 Frontend démarré avec PID: $FRONTEND_PID"
    
    # Attendre que le frontend soit prêt
    echo "⏳ Attente du démarrage du frontend..."
    sleep 10
    echo "✅ Frontend prêt sur http://localhost:4201"
}

# Fonction pour tester la connexion
test_connection() {
    echo "🧪 Test de la connexion..."
    
    # Test MongoDB
    if mongo --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB connecté"
    else
        echo "❌ MongoDB non connecté"
    fi
    
    # Test Backend
    if curl -s http://localhost:3001/api/v1/ > /dev/null 2>&1; then
        echo "✅ Backend connecté"
    else
        echo "❌ Backend non connecté"
    fi
    
    # Test Frontend
    if curl -s http://localhost:4201/ > /dev/null 2>&1; then
        echo "✅ Frontend connecté"
    else
        echo "❌ Frontend non connecté"
    fi
}

# Fonction pour afficher les URLs de test
show_urls() {
    echo ""
    echo "🌐 URLs de test:"
    echo "📋 Dashboard: http://localhost:4201"
    echo "🔧 Configuration app: http://localhost:4201/applications/configure/68bf71ef4198a0b558e988a8"
    echo "🔄 Nouvelle app avec plan: http://localhost:4201/applications/configure/68bf764373dea946000b5480"
    echo "📚 API Documentation: http://localhost:3001/api/docs"
    echo ""
}

# Exécution du script
main() {
    check_mongodb
    start_backend
    start_frontend
    test_connection
    show_urls
    
    echo "🎉 Projet démarré avec succès !"
    echo "📝 Pour arrêter les services, utilisez Ctrl+C"
    
    # Garder le script en vie
    wait
}

# Piège pour nettoyer les processus à l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "🔧 Backend arrêté"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "🎨 Frontend arrêté"
    fi
    echo "✅ Nettoyage terminé"
    exit 0
}

trap cleanup INT TERM

# Démarrer le script principal
main
