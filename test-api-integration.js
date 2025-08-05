const axios = require("axios");

const API_BASE = "http://localhost:3001/api/v1/api/v1";

async function testAPIIntegration() {
  console.log("🧪 Test de l'intégration API Frontend-Backend\n");

  try {
    // Test 1: Récupération des paramètres de facturation
    console.log("1️⃣ Test des paramètres de facturation...");
    const billingSettings = await axios.get(`${API_BASE}/billing/settings`);
    console.log("✅ Paramètres de facturation récupérés:", {
      currency: billingSettings.data.defaultCurrency,
      taxRate: billingSettings.data.taxRate,
      company: billingSettings.data.companyName,
    });

    // Test 2: Mise à jour des paramètres de facturation
    console.log("\n2️⃣ Test de mise à jour des paramètres...");
    const updateData = {
      companyName: "Test Company Update",
      companyEmail: "test@update.com",
      taxRate: 21,
    };
    const updatedSettings = await axios.put(
      `${API_BASE}/billing/settings`,
      updateData
    );
    console.log("✅ Paramètres mis à jour:", {
      company: updatedSettings.data.companyName,
      email: updatedSettings.data.companyEmail,
      taxRate: updatedSettings.data.taxRate,
    });

    // Test 3: Récupération des plans
    console.log("\n3️⃣ Test de récupération des plans...");
    const plans = await axios.get(`${API_BASE}/billing/plans`);
    console.log(
      `✅ ${plans.data.length} plans récupérés:`,
      plans.data.map((p) => ({
        name: p.name,
        price: p.price,
        active: p.isActive,
      }))
    );

    // Test 4: Création d'un nouveau plan
    console.log("\n4️⃣ Test de création d'un nouveau plan...");
    const newPlan = {
      name: "Plan Test Frontend",
      description: "Plan créé depuis le test d'intégration",
      price: 15.99,
      interval: "month",
      features: ["Feature test 1", "Feature test 2"],
      isActive: true,
      maxUsers: 2000,
      maxApplications: 2,
      hasApiAccess: true,
      hasAdvancedAnalytics: false,
      hasPrioritySupport: false,
    };
    const createdPlan = await axios.post(`${API_BASE}/billing/plans`, newPlan);
    console.log("✅ Plan créé:", {
      id: createdPlan.data._id,
      name: createdPlan.data.name,
      price: createdPlan.data.price,
    });

    // Test 5: Vérification finale
    console.log("\n5️⃣ Vérification finale...");
    const finalPlans = await axios.get(`${API_BASE}/billing/plans`);
    console.log(`✅ Total final: ${finalPlans.data.length} plans`);

    console.log("\n🎉 Tous les tests d'intégration API ont réussi !");
    console.log(
      "✅ Le frontend peut maintenant communiquer correctement avec le backend"
    );
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testAPIIntegration();
