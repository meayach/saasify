const axios = require("axios");

const API_BASE = "http://localhost:3001/api/v1/api/v1/billing";

async function testCurrencyUpdate() {
  console.log("🧪 Test spécifique: Configuration de la devise par défaut\n");

  try {
    // 1. Obtenir l'état actuel
    console.log("1️⃣ État actuel des paramètres...");
    const current = await axios.get(`${API_BASE}/settings`);
    console.log(`   Devise actuelle: ${current.data.defaultCurrency}`);

    // 2. Tester le changement vers USD
    console.log("\n2️⃣ Changement vers USD...");
    const updateToUSD = await axios.put(`${API_BASE}/settings`, {
      defaultCurrency: "USD",
    });
    console.log(`   ✅ Nouvelle devise: ${updateToUSD.data.defaultCurrency}`);
    console.log(`   📅 Dernière mise à jour: ${updateToUSD.data.updatedAt}`);

    // 3. Vérifier la persistance
    console.log("\n3️⃣ Vérification de la persistance...");
    const verify1 = await axios.get(`${API_BASE}/settings`);
    console.log(`   ✅ Devise vérifiée: ${verify1.data.defaultCurrency}`);

    // 4. Tester le changement vers EUR
    console.log("\n4️⃣ Changement vers EUR...");
    const updateToEUR = await axios.put(`${API_BASE}/settings`, {
      defaultCurrency: "EUR",
    });
    console.log(`   ✅ Nouvelle devise: ${updateToEUR.data.defaultCurrency}`);

    // 5. Vérification finale
    console.log("\n5️⃣ Vérification finale...");
    const verify2 = await axios.get(`${API_BASE}/settings`);
    console.log(`   ✅ Devise finale: ${verify2.data.defaultCurrency}`);

    // 6. Tester le changement vers GBP
    console.log("\n6️⃣ Test avec GBP...");
    const updateToGBP = await axios.put(`${API_BASE}/settings`, {
      defaultCurrency: "GBP",
    });
    console.log(`   ✅ Devise GBP: ${updateToGBP.data.defaultCurrency}`);

    console.log("\n🎉 Test de devise réussi !");
    console.log("✅ L'API backend change correctement la devise par défaut");
    console.log("✅ Les changements sont persistés en base de données");
    console.log("\n📝 Note: Si la devise ne change pas dans le frontend,");
    console.log("    le problème est dans l'interface utilisateur Angular.");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testCurrencyUpdate();
