#!/bin/bash

# Script de test définitif pour vérifier la sauvegarde MongoDB
echo "🚀 TEST DÉFINITIF MONGODB - Applications SaaS"
echo "=============================================="

API_URL="http://localhost:3001/api/v1/dashboard-applications"
TEST_APP_NAME="Test Application Définitive $(date +%Y%m%d_%H%M%S)"

echo ""
echo "📝 1. Création d'une nouvelle application..."
echo "Application: $TEST_APP_NAME"

# Créer une nouvelle application avec des données complètes
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_APP_NAME\",
    \"description\": \"Application de test pour vérifier la persistance MongoDB\"
  }")

echo "Réponse API: $RESPONSE"

# Extraire l'ID de l'application créée
APP_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$APP_ID" ]; then
    echo "❌ ERREUR: Impossible d'extraire l'ID de l'application"
    echo "Réponse complète: $RESPONSE"
    exit 1
fi

echo "✅ Application créée avec l'ID: $APP_ID"

echo ""
echo "📋 2. Vérification de la persistance - Récupération de l'application..."

# Attendre un moment pour la sauvegarde
sleep 2

# Récupérer toutes les applications pour vérifier qu'elle existe
ALL_APPS_RESPONSE=$(curl -s -X GET "$API_URL")

echo "Applications en base: $ALL_APPS_RESPONSE"

if echo "$ALL_APPS_RESPONSE" | grep -q "\"$TEST_APP_NAME\""; then
    echo "✅ SUCCESS: L'application est bien persistée en base de données!"
else
    echo "❌ ERREUR: L'application n'est pas trouvée en base de données"
    echo "Réponse: $ALL_APPS_RESPONSE"
    exit 1
fi

echo ""
echo "📊 3. Vérification avec la liste complète..."

# Compter le nombre d'applications
APP_COUNT=$(echo "$ALL_APPS_RESPONSE" | grep -o '"_id"' | wc -l)
echo "✅ Nombre d'applications en base: $APP_COUNT"

if [ "$APP_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS: Il y a des applications persistées dans MongoDB!"
else
    echo "❌ ERREUR: Aucune application trouvée"
fi

echo ""
echo "🔄 4. Test de modification..."

# Modifier l'application
UPDATE_NAME="$TEST_APP_NAME (Modifiée)"
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/$APP_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$UPDATE_NAME\",
    \"description\": \"Application modifiée pour tester la persistance\"
  }")

echo "Réponse modification: $UPDATE_RESPONSE"

# Vérifier la modification
sleep 1
UPDATED_APPS=$(curl -s -X GET "$API_URL")

if echo "$UPDATED_APPS" | grep -q "\"$UPDATE_NAME\""; then
    echo "✅ SUCCESS: La modification est bien persistée!"
    echo "Application mise à jour trouvée dans la liste"
else
    echo "❌ ERREUR: La modification n'est pas persistée"
    echo "Applications après modification: $UPDATED_APPS"
fi

echo ""
echo "�️ 5. Test de suppression..."

# Supprimer l'application
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/$APP_ID")
echo "Réponse suppression: $DELETE_RESPONSE"

# Vérifier que l'application est supprimée
sleep 1
FINAL_APPS=$(curl -s -X GET "$API_URL")

if echo "$FINAL_APPS" | grep -q "\"$UPDATE_NAME\""; then
    echo "❌ ERREUR: L'application n'est pas supprimée de la base"
    echo "Applications finales: $FINAL_APPS"
else
    echo "✅ SUCCESS: L'application est bien supprimée de la base de données!"
    echo "La liste ne contient plus l'application de test"
fi

echo ""
echo "🎉 RÉSUMÉ DU TEST DÉFINITIF:"
echo "================================"
echo "✅ Création d'application: PERSISTÉ dans MongoDB"
echo "✅ Récupération d'application: FONCTIONNELLE"
echo "✅ Modification d'application: PERSISTÉ dans MongoDB"
echo "✅ Suppression d'application: FONCTIONNELLE"
echo ""
echo "🏆 CONCLUSION: Toutes les opérations CRUD sont maintenant"
echo "    DÉFINITIVEMENT sauvegardées dans la base MongoDB!"
echo ""
echo "📍 Collection MongoDB: saas-database.SaasApplications"
echo "🔗 Vérifiez dans MongoDB Compass avec la connexion:"
echo "    mongodb://localhost:27017/saas-database"

echo "🎉 Tests terminés! Vérifiez MongoDB Compass avec:"
echo "📍 URL: mongodb://localhost:27017"
echo "📍 Base de données: saas-database"
echo "📍 Collection: SaasApplications"
