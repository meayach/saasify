const axios = require("axios");

const BACKEND_URL = "http://localhost:3001/api/v1";
const FRONTEND_URL = "http://localhost:4200";

// Configuration des tests
const testConfig = {
  timeout: 10000,
  retries: 3,
};

// Fonction utilitaire pour les logs colorés
const log = {
  success: (msg) => console.log("\x1b[32m✓\x1b[0m", msg),
  error: (msg) => console.log("\x1b[31m✗\x1b[0m", msg),
  info: (msg) => console.log("\x1b[36mℹ\x1b[0m", msg),
  warning: (msg) => console.log("\x1b[33m⚠\x1b[0m", msg),
};

// Variables globales pour les tests
let authToken = null;
let testUser = null;

async function testBackendHealth() {
  log.info("Test de santé du backend...");
  try {
    const response = await axios
      .get(`${BACKEND_URL}/health`, {
        timeout: 5000,
      })
      .catch(async () => {
        // Si /health n'existe pas, essayons une route qui existe
        return await axios.get(`${BACKEND_URL}/users/profile`, {
          timeout: 5000,
          validateStatus: function (status) {
            // Accepter 401 car c'est normal sans token
            return status === 401 || (status >= 200 && status < 300);
          },
        });
      });

    log.success("Backend accessible");
    return true;
  } catch (error) {
    log.error(`Backend non accessible: ${error.message}`);
    return false;
  }
}

async function testFrontendHealth() {
  log.info("Test de santé du frontend...");
  try {
    const response = await axios.get(FRONTEND_URL, {
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
    });

    log.success("Frontend accessible");
    return true;
  } catch (error) {
    log.error(`Frontend non accessible: ${error.message}`);
    return false;
  }
}

async function createTestUser() {
  log.info("Création d'un utilisateur de test...");

  const userData = {
    email: `test.profile.${Date.now()}@example.com`,
    password: "TestPassword123!",
    firstName: "Test",
    lastName: "User",
    companyName: "Test Company",
  };

  try {
    // Essayons d'abord de créer l'utilisateur
    const response = await axios
      .post(`${BACKEND_URL}/auth/register`, userData, {
        timeout: testConfig.timeout,
      })
      .catch(async (error) => {
        if (error.response && error.response.status === 409) {
          // L'utilisateur existe déjà, essayons de nous connecter
          log.warning("Utilisateur existe déjà, tentative de connexion...");
          return await axios.post(`${BACKEND_URL}/auth/login`, {
            email: userData.email,
            password: userData.password,
          });
        }
        throw error;
      });

    if (response.data.access_token || response.data.token) {
      authToken = response.data.access_token || response.data.token;
      testUser = userData;
      log.success("Utilisateur de test créé/connecté avec succès");
      return true;
    } else {
      log.error("Pas de token reçu dans la réponse");
      return false;
    }
  } catch (error) {
    log.error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return false;
  }
}

async function testGetUserProfile() {
  log.info("Test de récupération du profil utilisateur...");

  try {
    const response = await axios.get(`${BACKEND_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      timeout: testConfig.timeout,
    });

    if (response.data && response.data.email) {
      log.success("Profil utilisateur récupéré avec succès");
      log.info(`Email: ${response.data.email}`);
      log.info(`Nom: ${response.data.firstName} ${response.data.lastName}`);
      return response.data;
    } else {
      log.error("Données de profil invalides");
      return null;
    }
  } catch (error) {
    log.error(`Erreur lors de la récupération du profil: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return null;
  }
}

async function testUpdateUserProfile() {
  log.info("Test de mise à jour du profil utilisateur...");

  const updatedData = {
    firstName: "TestUpdated",
    lastName: "UserUpdated",
    phoneNumber: "+33123456789",
    streetAddress: "123 Rue de Test",
    city: "Paris",
    zipCode: "75001",
  };

  try {
    const response = await axios.put(
      `${BACKEND_URL}/users/profile`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        timeout: testConfig.timeout,
      }
    );

    if (response.data && response.data.firstName === updatedData.firstName) {
      log.success("Profil utilisateur mis à jour avec succès");
      log.info(
        `Nouveau nom: ${response.data.firstName} ${response.data.lastName}`
      );
      log.info(`Téléphone: ${response.data.phoneNumber}`);
      log.info(
        `Adresse: ${response.data.streetAddress}, ${response.data.city} ${response.data.zipCode}`
      );
      return true;
    } else {
      log.error("Données de profil mises à jour invalides");
      return false;
    }
  } catch (error) {
    log.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return false;
  }
}

async function testChangePassword() {
  log.info("Test de changement de mot de passe...");

  const passwordData = {
    currentPassword: testUser.password,
    newPassword: "NewTestPassword123!",
    confirmPassword: "NewTestPassword123!",
  };

  try {
    const response = await axios.put(
      `${BACKEND_URL}/users/change-password`,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        timeout: testConfig.timeout,
      }
    );

    if (response.status === 200) {
      log.success("Mot de passe changé avec succès");

      // Mettre à jour le mot de passe de test
      testUser.password = passwordData.newPassword;

      return true;
    } else {
      log.error("Erreur lors du changement de mot de passe");
      return false;
    }
  } catch (error) {
    log.error(`Erreur lors du changement de mot de passe: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return false;
  }
}

async function testLoginWithNewPassword() {
  log.info("Test de connexion avec le nouveau mot de passe...");

  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/login`,
      {
        email: testUser.email,
        password: testUser.password,
      },
      {
        timeout: testConfig.timeout,
      }
    );

    if (response.data.access_token || response.data.token) {
      log.success("Connexion réussie avec le nouveau mot de passe");
      authToken = response.data.access_token || response.data.token;
      return true;
    } else {
      log.error("Pas de token reçu lors de la connexion");
      return false;
    }
  } catch (error) {
    log.error(
      `Erreur lors de la connexion avec le nouveau mot de passe: ${error.message}`
    );
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return false;
  }
}

async function testEmailAvailability() {
  log.info("Test de vérification de disponibilité d'email...");

  const testEmail = `nonexistent.${Date.now()}@example.com`;

  try {
    const response = await axios.get(
      `${BACKEND_URL}/users/check-email/${testEmail}`,
      {
        timeout: testConfig.timeout,
      }
    );

    if (response.data && response.data.available === true) {
      log.success("Vérification de disponibilité d'email fonctionne");
      return true;
    } else {
      log.error("Réponse de vérification d'email invalide");
      return false;
    }
  } catch (error) {
    log.error(`Erreur lors de la vérification d'email: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return false;
  }
}

async function runAllTests() {
  console.log(
    "\n🧪 Tests de fonctionnalité : Modification de profil et changement de mot de passe\n"
  );
  console.log("=".repeat(80));

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: "Santé du backend", fn: testBackendHealth },
    { name: "Santé du frontend", fn: testFrontendHealth },
    { name: "Création utilisateur de test", fn: createTestUser },
    { name: "Récupération du profil", fn: testGetUserProfile },
    { name: "Mise à jour du profil", fn: testUpdateUserProfile },
    { name: "Changement de mot de passe", fn: testChangePassword },
    {
      name: "Connexion avec nouveau mot de passe",
      fn: testLoginWithNewPassword,
    },
    { name: "Vérification email disponible", fn: testEmailAvailability },
  ];

  for (const test of tests) {
    results.total++;
    console.log(`\n${results.total}. ${test.name}`);
    console.log("-".repeat(40));

    try {
      const success = await test.fn();
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log.error(`Test échoué avec une exception: ${error.message}`);
      results.failed++;
    }

    // Petite pause entre les tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📊 RÉSULTATS DES TESTS");
  console.log("-".repeat(30));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Réussis: ${results.passed}`);
  console.log(`❌ Échoués: ${results.failed}`);
  console.log(
    `📈 Taux de réussite: ${((results.passed / results.total) * 100).toFixed(
      1
    )}%`
  );

  if (results.failed === 0) {
    console.log(
      "\n🎉 Tous les tests sont passés ! Les fonctionnalités de modification de profil et de changement de mot de passe fonctionnent correctement."
    );
  } else {
    console.log(
      `\n⚠️  ${results.failed} test(s) ont échoué. Vérifiez les logs ci-dessus pour plus de détails.`
    );
  }

  console.log("\n" + "=".repeat(80));
}

// Exécution des tests
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error(
      "\n💥 Erreur fatale lors de l'exécution des tests:",
      error.message
    );
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testBackendHealth,
  testFrontendHealth,
  testGetUserProfile,
  testUpdateUserProfile,
  testChangePassword,
};
