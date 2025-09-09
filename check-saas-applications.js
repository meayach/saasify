// Script pour vérifier les applications dans SaasApplications
const { MongoClient } = require("mongodb");

async function checkSaasApplications() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("🔗 Connecté à MongoDB");

    const db = client.db("saas-database");
    const collection = db.collection("SaasApplications");

    // Récupérer toutes les applications de SaasApplications
    console.log("📊 Applications dans SaasApplications:");
    const allApps = await collection.find({}).toArray();
    allApps.forEach((app, index) => {
      console.log(`${index + 1}. ID: ${app._id}`);
      console.log(`   Name: ${app.name || "N/A"}`);
      console.log(`   Status: ${app.status || "N/A"}`);
      console.log(`   DefaultPlanId: ${app.defaultPlanId || "Non défini"}`);
      console.log(`   CreatedAt: ${app.createdAt || "N/A"}`);
      console.log(`   Toutes les propriétés:`, Object.keys(app));
      console.log("   ---");
    });

    // Chercher spécifiquement l'ID mentionné
    const specificId = "68bf71ef4198a0b558e988a8";
    console.log(`\n🔍 Recherche de l'ID spécifique: ${specificId}`);

    // Essayer différentes approches pour trouver cette application
    let foundApp = await collection.findOne({ _id: specificId });
    if (!foundApp) {
      try {
        foundApp = await collection.findOne({
          _id: require("mongodb").ObjectId.createFromHexString(specificId),
        });
      } catch (error) {
        console.log("⚠️ Erreur avec ObjectId conversion");
      }
    }

    if (foundApp) {
      console.log("✅ Application trouvée:", foundApp);
    } else {
      console.log("❌ Application non trouvée");

      // Chercher par nom contenant "Dropbox" ou similaire
      const nameSearch = await collection.find({ name: /dropbox/i }).toArray();
      if (nameSearch.length > 0) {
        console.log("📋 Applications trouvées par nom (Dropbox):");
        nameSearch.forEach((app) => console.log(app));
      }
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await client.close();
    console.log("🔐 Connexion fermée");
  }
}

checkSaasApplications();
