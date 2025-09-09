// Script pour vérifier les données d'application avec defaultPlanId
const { MongoClient } = require("mongodb");

async function checkApplicationData() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("🔗 Connecté à MongoDB");

    const db = client.db("saas-database");
    const collection = db.collection("saasapplications");

    // Récupérer l'application spécifique par ID
    const applicationId = "68bf71ef4198a0b558e988a8";
    let application;
    try {
      application = await collection.findOne({
        _id: require("mongodb").ObjectId.createFromHexString(applicationId),
      });
    } catch (error) {
      console.log("⚠️ Erreur avec ObjectId, tentative avec string ID");
      application = await collection.findOne({ _id: applicationId });
    }

    if (application) {
      console.log("📋 Application trouvée:");
      console.log("ID:", application._id);
      console.log("Name:", application.name);
      console.log("Status:", application.status);
      console.log("DefaultPlanId:", application.defaultPlanId);
      console.log("CreatedAt:", application.createdAt);
    } else {
      console.log("❌ Application non trouvée avec ID:", applicationId);

      // Chercher par nom "Dropbox" mentionné dans les logs
      const dropboxApp = await collection.findOne({ name: "Dropbox" });
      if (dropboxApp) {
        console.log("📋 Application Dropbox trouvée:");
        console.log("ID:", dropboxApp._id);
        console.log("Name:", dropboxApp.name);
        console.log("Status:", dropboxApp.status);
        console.log("DefaultPlanId:", dropboxApp.defaultPlanId);
        console.log("CreatedAt:", dropboxApp.createdAt);
      }
    }

    // Récupérer toutes les applications pour voir la structure
    console.log("\n📊 Toutes les applications:");
    const allApps = await collection.find({}).toArray();
    allApps.forEach((app, index) => {
      console.log(
        `${index + 1}. ${app.name} - Status: ${app.status} - DefaultPlanId: ${
          app.defaultPlanId || "Non défini"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await client.close();
    console.log("🔐 Connexion fermée");
  }
}

checkApplicationData();
