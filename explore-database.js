// Script pour explorer les collections MongoDB
const { MongoClient } = require("mongodb");

async function exploreDatabase() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("🔗 Connecté à MongoDB");

    const db = client.db("saas-database");

    // Lister toutes les collections
    const collections = await db.listCollections().toArray();
    console.log("📁 Collections disponibles:");
    collections.forEach((col) => {
      console.log(`- ${col.name}`);
    });

    // Vérifier les collections qui contiennent "application"
    for (const col of collections) {
      if (col.name.toLowerCase().includes("application")) {
        console.log(`\n📋 Contenu de ${col.name}:`);
        const collection = db.collection(col.name);
        const documents = await collection.find({}).limit(5).toArray();
        documents.forEach((doc, index) => {
          console.log(
            `${index + 1}. ID: ${doc._id}, Name: ${
              doc.name || "N/A"
            }, DefaultPlanId: ${doc.defaultPlanId || "Non défini"}`
          );
        });
      }
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await client.close();
    console.log("🔐 Connexion fermée");
  }
}

exploreDatabase();
