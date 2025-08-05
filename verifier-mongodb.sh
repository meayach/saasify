#!/bin/bash

echo "🔍 VÉRIFICATION MONGODB - Collections et Documents"
echo "==============================================="

echo ""
echo "📁 1. Vérification de la connexion à MongoDB..."
mongo_result=$(mongo --eval "db.adminCommand('ping')" --quiet 2>/dev/null || echo "ERREUR_CONNEXION")

if [[ "$mongo_result" == *"ERREUR_CONNEXION"* ]]; then
    echo "❌ Impossible de se connecter à MongoDB avec 'mongo'"
    echo "🔧 Essayons avec 'mongosh'..."
    
    mongosh_result=$(mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null || echo "ERREUR_MONGOSH")
    
    if [[ "$mongosh_result" == *"ERREUR_MONGOSH"* ]]; then
        echo "❌ MongoDB CLI non disponible. Vérification par l'API uniquement."
        CLI_AVAILABLE=false
    else
        echo "✅ MongoDB connecté via mongosh"
        CLI_AVAILABLE=true
        MONGO_CMD="mongosh"
    fi
else
    echo "✅ MongoDB connecté via mongo"
    CLI_AVAILABLE=true
    MONGO_CMD="mongo"
fi

echo ""
echo "📊 2. Vérification par API REST..."
APPS_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/v1/dashboard-applications")
APP_COUNT=$(echo "$APPS_RESPONSE" | grep -o '"_id"' | wc -l | tr -d ' ')

echo "Applications trouvées via API: $APP_COUNT"
if [ "$APP_COUNT" -gt 0 ]; then
    echo "✅ Les applications sont bien accessibles via l'API"
    echo "Premier document:"
    echo "$APPS_RESPONSE" | head -c 200
    echo "..."
else
    echo "❌ Aucune application trouvée via l'API"
fi

if [ "$CLI_AVAILABLE" = true ]; then
    echo ""
    echo "📁 3. Exploration des bases de données MongoDB..."
    
    echo "Bases de données disponibles:"
    $MONGO_CMD --eval "db.adminCommand('listDatabases')" --quiet
    
    echo ""
    echo "📋 4. Vérification de la base 'saas-database'..."
    
    echo "Collections dans saas-database:"
    $MONGO_CMD saas-database --eval "db.getCollectionNames()" --quiet
    
    echo ""
    echo "🔍 5. Recherche des collections contenant 'application'..."
    COLLECTIONS=$($MONGO_CMD saas-database --eval "db.getCollectionNames()" --quiet)
    echo "Collections trouvées: $COLLECTIONS"
    
    echo ""
    echo "📊 6. Vérification du contenu des collections d'applications..."
    
    # Vérifier différents noms possibles de collections
    for collection in "saasapplicationpojos" "SaasApplicationPOJO" "SaasApplications" "applications" "saasApplications" "saas_applications"
    do
        echo "Vérification de la collection: $collection"
        COUNT=$($MONGO_CMD saas-database --eval "db.$collection.countDocuments()" --quiet 2>/dev/null || echo "0")
        if [ "$COUNT" != "0" ] && [ "$COUNT" != "" ]; then
            echo "✅ Collection '$collection' trouvée avec $COUNT documents"
            echo "Premier document:"
            $MONGO_CMD saas-database --eval "db.$collection.findOne()" --quiet
            echo ""
        else
            echo "❌ Collection '$collection' vide ou inexistante"
        fi
    done
    
else
    echo "⚠️ CLI MongoDB non disponible, utilisation de l'API uniquement"
fi

echo ""
echo "🎯 RÉSUMÉ:"
echo "=========="
echo "📊 Applications via API: $APP_COUNT"
echo "🔗 URL API: http://localhost:3001/api/v1/dashboard-applications"
echo "📍 Base MongoDB: saas-database"
echo ""
echo "💡 CONSEIL: Utilisez MongoDB Compass avec l'URL:"
echo "   mongodb://localhost:27017/saas-database"
echo "   et explorez toutes les collections pour trouver vos données!"
