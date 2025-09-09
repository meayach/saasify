// Script pour synchroniser l'application SaasApplications vers dashboard
const { MongoClient } = require("mongodb");

async function syncApplicationToDashboard() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("🔗 Connecté à MongoDB");

    const db = client.db("saas-database");

    // Récupérer l'application de SaasApplications
    const saasCollection = db.collection("SaasApplications");
    const targetId = "68bf71ef4198a0b558e988a8";
    const saasApp = await saasCollection.findOne({
      _id: require("mongodb").ObjectId.createFromHexString(targetId),
    });

    if (!saasApp) {
      console.log("❌ Application non trouvée dans SaasApplications");
      return;
    }

    console.log("📋 Application SaaS trouvée:", saasApp.applicationName);

    // Récupérer un plan par défaut
    const plansCollection = db.collection("saasplans");
    const plans = await plansCollection.find({}).toArray();
    const defaultPlan = plans.find((p) => p.name === "Plan Pro") || plans[0];

    console.log(
      "🎯 Plan par défaut sélectionné:",
      defaultPlan.name,
      defaultPlan._id
    );

    // Créer l'application correspondante dans dashboard
    const dashboardCollection = db.collection("saasapplications");

    const dashboardApp = {
      _id: saasApp._id, // Utiliser le même ID
      name: saasApp.applicationName,
      slug:
        saasApp.applicationName.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        saasApp._id.toString().substring(0, 6),
      status: saasApp.status,
      defaultPlanId: defaultPlan._id.toString(),
      isActive: saasApp.status === "active",
      createdAt: saasApp.createdAt,
      updatedAt: new Date(),
    };

    // Insérer ou mettre à jour
    const result = await dashboardCollection.replaceOne(
      { _id: saasApp._id },
      dashboardApp,
      { upsert: true }
    );

    console.log(
      "✅ Application synchronisée dans dashboard:",
      result.upsertedId || "updated"
    );

    // Vérifier le résultat
    const syncedApp = await dashboardCollection.findOne({ _id: saasApp._id });
    console.log("📋 Application synchronisée:", {
      id: syncedApp._id,
      name: syncedApp.name,
      status: syncedApp.status,
      defaultPlanId: syncedApp.defaultPlanId,
      isActive: syncedApp.isActive,
    });

    console.log("\n🔗 URL pour tester l'application originale:");
    console.log(`http://localhost:4200/applications/configure/${targetId}`);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await client.close();
    console.log("🔐 Connexion fermée");
  }
}

syncApplicationToDashboard();
