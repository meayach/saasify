#!/usr/bin/env node

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api/v1";

async function createMultiplePlans() {
  try {
    console.log("🔄 Création de plusieurs plans de test...\n");

    const plans = [
      {
        name: "Plan Pro",
        description: "Plan professionnel avec plus de fonctionnalités",
        price: 29.99,
        billingCycle: "MONTHLY",
        type: "PREMIUM",
        features: [
          "Jusqu'à 5 Applications",
          "Support prioritaire",
          "Analytics avancées",
          "Jusqu'à 10000 utilisateurs",
        ],
        currencyId: "507f1f77bcf86cd799439011",
        applicationId: "689fbd45522340b31202c1b0",
      },
      {
        name: "Plan Enterprise",
        description: "Plan complet pour les grandes organisations",
        price: 99.99,
        billingCycle: "MONTHLY",
        type: "ENTERPRISE",
        features: [
          "Applications illimitées",
          "Support dédié 24/7",
          "Analytics complètes",
          "Utilisateurs illimités",
          "API accès complet",
        ],
        currencyId: "507f1f77bcf86cd799439011",
        applicationId: "689fbd45522340b31202c1b0",
      },
    ];

    for (let i = 0; i < plans.length; i++) {
      const planData = plans[i];
      console.log(`${i + 2}️⃣ Création du plan: ${planData.name}`);

      try {
        const response = await axios.post(`${BASE_URL}/plans`, planData);
        console.log(
          `✅ Plan "${planData.name}" créé avec succès (ID: ${response.data.id})`
        );
      } catch (error) {
        console.error(
          `❌ Erreur pour "${planData.name}":`,
          error.response?.data || error.message
        );
      }
    }

    console.log("\n📋 Récapitulatif des plans créés...");
    const plansResponse = await axios.get(`${BASE_URL}/plans`);
    const allPlans = plansResponse.data.plans || plansResponse.data || [];

    console.log(`\n✅ Total: ${allPlans.length} plans disponibles:`);
    allPlans.forEach((plan, index) => {
      console.log(
        `   ${index + 1}. ${plan.name} - ${plan.price}$ (${plan.type})`
      );
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error.response?.data || error.message);
  }
}

// Exécuter la création
createMultiplePlans();
