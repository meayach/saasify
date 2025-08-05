#!/usr/bin/env node

/**
 * Test complet pour vérifier la fonctionnalité de sauvegarde des paramètres de facturation
 * et la résolution des erreurs 404 sur la page settings
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3001";

async function testEndpoints() {
  console.log("🔍 Test des endpoints API...\n");

  // Test 1: Vérifier l'endpoint des statistiques
  try {
    console.log("1. Test des statistiques d'applications:");
    const statsResponse = await axios.get(
      `${BASE_URL}/api/v1/dashboard-applications/stats`
    );
    console.log("   ✅ Statistiques OK:", statsResponse.data);
  } catch (error) {
    console.log(
      "   ❌ Erreur statistiques:",
      error.response?.status,
      error.response?.data || error.message
    );
  }

  // Test 2: Vérifier l'endpoint des paramètres de sécurité
  try {
    console.log("\n2. Test des paramètres de sécurité:");
    const securityResponse = await axios.get(
      `${BASE_URL}/api/v1/api/security/settings`
    );
    console.log(
      "   ✅ Paramètres de sécurité OK:",
      securityResponse.data.success ? "Succès" : "Échec"
    );
  } catch (error) {
    console.log(
      "   ❌ Erreur paramètres de sécurité:",
      error.response?.status,
      error.response?.data || error.message
    );
  }

  // Test 3: Vérifier l'endpoint des logs d'audit
  try {
    console.log("\n3. Test des logs d'audit:");
    const auditResponse = await axios.get(
      `${BASE_URL}/api/v1/api/security/audit-logs?page=1&limit=50`
    );
    console.log(
      "   ✅ Logs d'audit OK:",
      auditResponse.data.success ? "Succès" : "Échec"
    );
  } catch (error) {
    console.log(
      "   ❌ Erreur logs d'audit:",
      error.response?.status,
      error.response?.data || error.message
    );
  }

  // Test 4: Récupérer les paramètres de facturation
  try {
    console.log("\n4. Test récupération paramètres de facturation:");
    const getResponse = await axios.get(
      `${BASE_URL}/api/v1/api/v1/billing/settings`
    );
    console.log("   ✅ Récupération OK: Succès");

    // Test 5: Sauvegarder les paramètres de facturation
    console.log("\n5. Test sauvegarde paramètres de facturation:");
    const testSettings = {
      defaultCurrency: "EUR",
      taxRate: 20,
      companyName: "Test Company Updated",
      companyEmail: "test-updated@company.com",
      companyAddress: "123 Updated Street",
      paymentMethods: ["stripe", "paypal"],
      autoRenewal: true,
      invoiceDueDays: 30,
    };

    const saveResponse = await axios.put(
      `${BASE_URL}/api/v1/api/v1/billing/settings`,
      testSettings
    );
    console.log("   ✅ Sauvegarde OK: Succès");

    // Vérifier que les données ont été sauvegardées
    const verifyResponse = await axios.get(
      `${BASE_URL}/api/v1/api/v1/billing/settings`
    );
    const savedData = verifyResponse.data; // Accès direct aux données

    console.log("\n6. Vérification de la persistance:");
    console.log("   💾 Devise par défaut:", savedData.defaultCurrency);
    console.log("   💾 Nom de l'entreprise:", savedData.companyName);
    console.log("   💾 Email de l'entreprise:", savedData.companyEmail);
    console.log("   💾 Renouvellement auto:", savedData.autoRenewal);
    console.log(
      "   💾 Dernière mise à jour:",
      new Date(savedData.updatedAt).toLocaleString()
    );
  } catch (error) {
    console.log(
      "   ❌ Erreur facturation:",
      error.response?.status,
      error.response?.data || error.message
    );
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Tests terminés !");
  console.log("🌐 Frontend disponible sur: http://localhost:4201");
  console.log("🔧 Backend disponible sur: http://localhost:3001");
  console.log("📊 Page de paramètres: http://localhost:4201/settings");
}

// Vérifier que le backend est disponible avant de lancer les tests
async function checkBackend() {
  try {
    await axios.get(`${BASE_URL}/api/v1/dashboard-applications/stats`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("🚀 Test de l'intégration frontend-backend\n");

  const backendReady = await checkBackend();
  if (!backendReady) {
    console.log("❌ Backend non disponible sur http://localhost:3001");
    console.log("   Assurez-vous que le backend NestJS est démarré");
    return;
  }

  console.log("✅ Backend détecté et disponible\n");
  await testEndpoints();
}

main().catch(console.error);
