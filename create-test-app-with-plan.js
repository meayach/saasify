// Script pour créer une application de test avec defaultPlanId
const { MongoClient } = require("mongodb");

async function createTestApplication() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("🔗 Connecté à MongoDB");

    const db = client.db("saas-database");

    // D'abord, récupérer un plan existant
    const plansCollection = db.collection("saasplans");
    const plans = await plansCollection.find({}).toArray();
    console.log(
      "📋 Plans disponibles:",
      plans.map((p) => ({ id: p._id, name: p.name, planName: p.planName }))
    );

    if (plans.length === 0) {
      console.log("❌ Aucun plan disponible");
      return;
    }

    const selectedPlan = plans[0]; // Prendre le premier plan
    console.log("🎯 Plan sélectionné:", selectedPlan);

    // Créer une application dans la collection dashboard (saasapplications)
    const dashboardCollection = db.collection("saasapplications");

    const newApp = {
      name: "Test Application avec Plan",
      status: "active",
      defaultPlanId: selectedPlan._id.toString(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await dashboardCollection.insertOne(newApp);
    console.log("✅ Application créée dans dashboard:", result.insertedId);

    // Vérifier que l'application a été créée avec le bon defaultPlanId
    const createdApp = await dashboardCollection.findOne({
      _id: result.insertedId,
    });
    console.log("📋 Application créée:", {
      id: createdApp._id,
      name: createdApp.name,
      status: createdApp.status,
      defaultPlanId: createdApp.defaultPlanId,
      isActive: createdApp.isActive,
    });

    console.log("\n🔗 URL pour tester:");
    console.log(
      `http://localhost:4200/applications/configure/${result.insertedId}`
    );
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await client.close();
    console.log("🔐 Connexion fermée");
  }
}

createTestApplication();
