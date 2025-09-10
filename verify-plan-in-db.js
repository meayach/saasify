// Script de vérification MongoDB - vérifier si le plan a été ajouté
// Connectez-vous à MongoDB et exécutez :

// 1. Se connecter à la base de données
use saasify_db

// 2. Vérifier l'application avec le plan sélectionné
db.saasApplications.findOne(
  {"_id": ObjectId("68c072ff53b48e9090de0f84")}, 
  {selectedPlan: 1, name: 1, defaultPlanId: 1}
)

// 3. Si le champ selectedPlan n'existe pas, l'ajouter manuellement :
db.saasApplications.updateOne(
  {"_id": ObjectId("68c072ff53b48e9090de0f84")},
  {
    $set: {
      "selectedPlan": {
        "id": "68bf66d7df8ea2b4245439ff",
        "name": "Plan Starter", 
        "description": "Plan parfait pour débuter avec votre application SaaS",
        "price": 9.99,
        "currency": "EUR",
        "billingCycle": "MONTHLY",
        "type": "BASIC",
        "isActive": true,
        "isPopular": false,
        "features": [],
        "createdAt": new Date("2025-09-08T23:29:27.206Z"),
        "updatedAt": new Date("2025-09-08T23:29:27.206Z")
      }
    }
  }
)

// 4. Vérifier à nouveau
db.saasApplications.findOne(
  {"_id": ObjectId("68c072ff53b48e9090de0f84")}, 
  {selectedPlan: 1, name: 1}
)
