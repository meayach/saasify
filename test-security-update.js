const fetch = require("node-fetch");

async function testSecurityUpdate() {
  const baseUrl = "http://localhost:3001/api/v1/api/security/settings";

  // Données de test valides selon le DTO
  const testData = {
    twoFactorEnabled: true,
    sessionTimeout: 60,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    auditLogEnabled: true,
    loginAttempts: {
      maxAttempts: 5,
      lockoutDuration: 30,
    },
    allowedIpRanges: [],
    apiAccessEnabled: true,
    webhookUrls: [],
  };

  try {
    console.log("Test de mise à jour des paramètres de sécurité...");
    console.log("URL:", baseUrl);
    console.log("Données:", JSON.stringify(testData, null, 2));

    const response = await fetch(baseUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const responseText = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", responseText);

    if (!response.ok) {
      console.error("Erreur HTTP:", response.status, response.statusText);
    } else {
      console.log("✅ Mise à jour réussie");
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

testSecurityUpdate();
