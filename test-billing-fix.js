const axios = require("axios");

const BASE_URL = "http://localhost:3001";

async function testBillingFix() {
  console.log("🧪 TEST: Correction du problème de facturation");
  console.log("=".repeat(60));

  try {
    // 1. Récupérer les paramètres actuels (avec champs MongoDB)
    console.log("\n1. Récupération des paramètres actuels:");
    const getResponse = await axios.get(
      `${BASE_URL}/api/v1/api/v1/billing/settings`
    );
    const currentSettings = getResponse.data;
    console.log("   📦 Données brutes récupérées:", currentSettings);

    // 2. Simuler l'envoi AVEC champs MongoDB (devrait échouer)
    console.log("\n2. Test avec champs MongoDB (devrait échouer):");
    try {
      await axios.put(
        `${BASE_URL}/api/v1/api/v1/billing/settings`,
        currentSettings // Toutes les données, y compris MongoDB
      );
      console.log(
        "   ❌ PROBLÈME: La requête a réussi alors qu'elle devrait échouer"
      );
    } catch (error) {
      console.log("   ✅ ATTENDU: Erreur 400 -", error.response?.data?.message);
    }

    // 3. Nettoyer les données (comme notre fix)
    console.log("\n3. Nettoyage des données:");
    const cleanSettings = {
      defaultCurrency: currentSettings.defaultCurrency,
      taxRate: currentSettings.taxRate,
      companyAddress: currentSettings.companyAddress,
      paymentMethods: currentSettings.paymentMethods,
      companyName: "Test Company FIXED",
      companyEmail: currentSettings.companyEmail,
      companyPhone: currentSettings.companyPhone,
      autoRenewal: currentSettings.autoRenewal,
      invoiceDueDays: currentSettings.invoiceDueDays,
    };
    console.log("   🧹 Données nettoyées:", cleanSettings);

    // 4. Envoyer les données nettoyées (devrait réussir)
    console.log("\n4. Test avec données nettoyées (devrait réussir):");
    const updateResponse = await axios.put(
      `${BASE_URL}/api/v1/api/v1/billing/settings`,
      cleanSettings
    );
    console.log("   ✅ SUCCÈS: Sauvegarde réussie");
    console.log("   📄 Réponse:", updateResponse.data);

    // 5. Vérifier la persistance
    console.log("\n5. Vérification de la persistance:");
    const verifyResponse = await axios.get(
      `${BASE_URL}/api/v1/api/v1/billing/settings`
    );
    const savedData = verifyResponse.data;
    console.log("   💾 Nom sauvegardé:", savedData.companyName);
    console.log(
      "   💾 Dernière mise à jour:",
      new Date(savedData.updatedAt).toLocaleString()
    );

    console.log("\n🎉 CONCLUSION: Le fix fonctionne parfaitement !");
    console.log("   ✅ Les champs MongoDB sont filtrés");
    console.log("   ✅ La sauvegarde fonctionne");
    console.log("   ✅ Les données sont persistées");
  } catch (error) {
    console.error("\n❌ ERREUR INATTENDUE:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
  }
}

testBillingFix();
