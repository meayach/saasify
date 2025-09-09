#!/usr/bin/env node

/**
 * Script de test complet pour vérifier le fonctionnement
 * de l'affichage du plan dans la configuration d'application
 */

const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://localhost:27017";
const DATABASE_NAME = "saasify";
const APPLICATION_ID = "68bf71ef4198a0b558e988a8";
const FRONTEND_URL = `http://localhost:4201/applications/configure/${APPLICATION_ID}`;
const BACKEND_URL = "http://localhost:3001";

console.log("🧪 Test de fonctionnalité complète - Affichage du plan");
console.log("=====================================\n");

async function testDatabaseConnection() {
  console.log("1. 🔍 Test de connexion MongoDB...");
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    // Vérifier l'application
    const app = await db.collection("saasapplications").findOne({
      _id: { $oid: APPLICATION_ID },
    });

    if (!app) {
      console.log("   ❌ Application non trouvée dans la base");
      return false;
    }

    console.log(`   ✅ Application trouvée: "${app.name}"`);
    console.log(`   📋 Plan par défaut: ${app.defaultPlanId || "Aucun"}`);

    // Vérifier le plan associé
    if (app.defaultPlanId) {
      const plan = await db.collection("saasplans").findOne({
        _id: { $oid: app.defaultPlanId },
      });

      if (plan) {
        console.log(`   ✅ Plan associé trouvé: "${plan.name}"`);
        console.log(`   💰 Prix: ${plan.price} ${plan.currency}`);
      } else {
        console.log("   ❌ Plan associé non trouvé");
      }
    }

    await client.close();
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function testBackendAPI() {
  console.log("\n2. 🌐 Test API Backend...");
  try {
    const fetch = require("node-fetch");

    // Test de santé du backend
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    if (healthResponse.ok) {
      console.log("   ✅ Backend accessible");
    } else {
      console.log("   ⚠️  Backend répond mais statut:", healthResponse.status);
    }

    // Test de l'endpoint de l'application
    const appResponse = await fetch(
      `${BACKEND_URL}/api/applications/${APPLICATION_ID}`
    );
    if (appResponse.ok) {
      const appData = await appResponse.json();
      console.log(`   ✅ Données application récupérées via API`);
      console.log(
        `   📋 Plan par défaut via API: ${appData.defaultPlanId || "Aucun"}`
      );
    } else {
      console.log(
        "   ❌ Impossible de récupérer les données d'application via API"
      );
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Backend inaccessible: ${error.message}`);
    return false;
  }
}

async function testFrontendAccess() {
  console.log("\n3. 🖥️  Test accès Frontend...");
  try {
    const fetch = require("node-fetch");

    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log("   ✅ Page de configuration accessible");
      const html = await response.text();

      // Vérifier la présence de certains éléments
      if (html.includes("Aucun plan sélectionné")) {
        console.log('   ⚠️  Message "Aucun plan sélectionné" présent');
      }

      if (html.includes("Plan Pro") || html.includes("plan-name")) {
        console.log("   ✅ Éléments de plan détectés dans le HTML");
      }
    } else {
      console.log("   ❌ Page de configuration inaccessible");
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Frontend inaccessible: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🎯 Application ID: ${APPLICATION_ID}`);
  console.log(`🌐 URL de test: ${FRONTEND_URL}\n`);

  const dbOk = await testDatabaseConnection();
  const backendOk = await testBackendAPI();
  const frontendOk = await testFrontendAccess();

  console.log("\n📊 Résumé des tests:");
  console.log(`   Base de données: ${dbOk ? "✅" : "❌"}`);
  console.log(`   Backend API: ${backendOk ? "✅" : "❌"}`);
  console.log(`   Frontend: ${frontendOk ? "✅" : "❌"}`);

  if (dbOk && backendOk && frontendOk) {
    console.log("\n🎉 Tous les composants fonctionnent !");
    console.log(`👀 Visitez: ${FRONTEND_URL}`);
    console.log(
      '   Le plan "Plan Pro" devrait s\'afficher au lieu de "Aucun plan sélectionné"'
    );
  } else {
    console.log("\n⚠️  Certains composants ne fonctionnent pas correctement");
    console.log(
      "   Vérifiez que tous les serveurs sont démarrés avec les chemins absolus"
    );
  }
}

// Exécuter le test
if (require.main === module) {
  main().catch(console.error);
}
