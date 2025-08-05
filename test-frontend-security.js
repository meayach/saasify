// Test exactement ce que fait le frontend
async function testFrontendRequest() {
  try {
    // Simulate exactly what the frontend sends
    const testData = {
      twoFactorEnabled: false,
      sessionTimeout: 120,
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

    console.log("Données à envoyer:", JSON.stringify(testData, null, 2));

    const response = await fetch(
      "http://localhost:3001/api/v1/api/security/settings",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (!response.ok) {
      console.error("❌ Échec de la requête");
    } else {
      console.log("✅ Requête réussie");
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

testFrontendRequest();
