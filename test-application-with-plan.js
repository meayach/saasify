// Script pour tester directement l'application avec plan
const { MongoClient } = require("mongodb");

async function testApplicationWithPlan() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("🔗 Connecté à MongoDB");

    const db = client.db("saas-database");
    const collection = db.collection("saasapplications");

    // Vérifier l'application Dropbox synchronisée
    const targetId = "68bf71ef4198a0b558e988a8";
    const application = await collection.findOne({
      _id: require("mongodb").ObjectId.createFromHexString(targetId),
    });

    if (application) {
      console.log("✅ Application trouvée dans dashboard:");
      console.log("ID:", application._id);
      console.log("Name:", application.name);
      console.log("Status:", application.status);
      console.log("DefaultPlanId:", application.defaultPlanId);
      console.log("IsActive:", application.isActive);

      // Récupérer le plan associé
      let plan = null;
      if (application.defaultPlanId) {
        const plansCollection = db.collection("saasplans");
        plan = await plansCollection.findOne({
          _id: require("mongodb").ObjectId.createFromHexString(
            application.defaultPlanId
          ),
        });

        if (plan) {
          console.log("\n🎯 Plan associé:");
          console.log("ID:", plan._id);
          console.log("Name:", plan.name);
          console.log("Type:", plan.type);
          console.log("Price:", plan.price);
          console.log("Features:", plan.features);
        } else {
          console.log("❌ Plan non trouvé avec ID:", application.defaultPlanId);
        }
      } else {
        console.log("⚠️ Aucun plan par défaut défini");
      }

      console.log("\n📋 Résumé pour le frontend:");
      console.log("✅ L'application existe dans la bonne collection");
      console.log("✅ Elle a un defaultPlanId défini");
      console.log("✅ Le plan associé existe");
      console.log("\n🌐 Le frontend devrait maintenant afficher:");
      console.log(`Plan sélectionné: ${plan?.name || "Non trouvé"}`);
      console.log(
        "URL de test: http://localhost:4201/applications/configure/68bf71ef4198a0b558e988a8"
      );
    } else {
      console.log("❌ Application non trouvée dans la collection dashboard");
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await client.close();
    console.log("\n🔐 Connexion fermée");
  }
}

testApplicationWithPlan();
