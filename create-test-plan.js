#!/usr/bin/env node

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api/v1";

async function createTestPlan() {
  try {
    console.log("🔄 Création d'un plan de test...\n");

    const planData = {
      name: "Plan Starter",
      description: "Plan parfait pour débuter avec votre application SaaS",
      price: 9.99,
      billingCycle: "MONTHLY",
      type: "BASIC",
      features: [
        "1 Application",
        "Support par email",
        "Analytics de base",
        "Jusqu'à 1000 utilisateurs",
      ],
      // IDs requis - nous utiliserons des ObjectIds valides
      currencyId: "507f1f77bcf86cd799439011", // ObjectId MongoDB valide
      applicationId: "689fbd45522340b31202c1b0", // ID de l'application existante
    };

    console.log("📋 Données du plan à créer:");
    console.log(JSON.stringify(planData, null, 2));
    console.log("");

    const response = await axios.post(`${BASE_URL}/plans`, planData);

    console.log("✅ Plan créé avec succès!");
    console.log("📋 Détails du plan créé:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création du plan:",
      error.response?.data || error.message
    );
  }
}

// Exécuter la création
createTestPlan();
