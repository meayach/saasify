#!/usr/bin/env node

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api/v1";

async function testPlanSelection() {
  try {
    console.log("🔄 Test de sélection de plan pour l'application...\n");

    // 1. Récupérer la liste des applications
    console.log("1️⃣ Récupération des applications...");
    const appsResponse = await axios.get(`${BASE_URL}/applications`);
    const applications = appsResponse.data.applications;

    if (applications.length === 0) {
      console.log("❌ Aucune application trouvée");
      return;
    }

    const app = applications[0];
    console.log(`✅ Application trouvée: ${app.name} (ID: ${app.id})`);
    console.log(`   Plan actuel: ${app.defaultPlan || "Aucun"}\n`);

    // 2. Récupérer les plans disponibles
    console.log("2️⃣ Récupération des plans disponibles...");
    const plansResponse = await axios.get(`${BASE_URL}/plans`);
    const plans = plansResponse.data.plans || plansResponse.data || [];

    if (plans.length === 0) {
      console.log("❌ Aucun plan trouvé");
      return;
    }

    console.log(`✅ ${plans.length} plans trouvés:`);
    plans.forEach((plan, index) => {
      console.log(
        `   ${index + 1}. ${plan.name} - ${plan.price}€/${plan.billingCycle}`
      );
    });
    console.log("");

    // 3. Sélectionner le premier plan disponible
    const selectedPlan = plans[0];
    const planId = selectedPlan.id || selectedPlan._id;

    console.log(`3️⃣ Sélection du plan: ${selectedPlan.name} (ID: ${planId})`);

    // 4. Mettre à jour l'application avec le plan sélectionné
    console.log("4️⃣ Sauvegarde du plan dans l'application...");
    const updateData = {
      defaultPlanId: planId,
    };

    const updateResponse = await axios.patch(
      `${BASE_URL}/applications/${app.id}`,
      updateData
    );
    console.log("✅ Plan sauvegardé avec succès!");

    // 5. Vérifier que le plan a été sauvegardé
    console.log("5️⃣ Vérification de la sauvegarde...");
    const verifyResponse = await axios.get(
      `${BASE_URL}/applications/${app.id}`
    );
    const updatedApp = verifyResponse.data;

    console.log(`\n📋 Résultat final:`);
    console.log(`   Application: ${updatedApp.name}`);
    console.log(
      `   Plan par défaut: ${
        updatedApp.defaultPlanId || updatedApp.defaultPlan || "Aucun"
      }`
    );

    const savedPlanId = updatedApp.defaultPlanId || updatedApp.defaultPlan;
    if (savedPlanId === planId) {
      console.log("✅ SUCCESS: Le plan a été correctement sauvegardé!");
    } else {
      console.log("❌ ERREUR: Le plan n'a pas été sauvegardé correctement");
      console.log("   Plan attendu:", planId);
      console.log("   Plan reçu:", savedPlanId);
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors du test:",
      error.response?.data || error.message
    );
  }
}

// Exécuter le test
testPlanSelection();
