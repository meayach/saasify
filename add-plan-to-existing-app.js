// Script pour ajouter un plan sélectionné à une application existante
const applicationId = "68c072ff53b48e9090de0f84";
const planStarterId = "68bf66d7df8ea2b4245439ff"; // Plan Starter

const selectedPlan = {
  id: "68bf66d7df8ea2b4245439ff",
  name: "Plan Starter",
  description: "Plan parfait pour débuter avec votre application SaaS",
  price: 9.99,
  currency: "EUR",
  billingCycle: "MONTHLY",
  type: "BASIC",
  isActive: true,
  isPopular: false,
  features: [],
  createdAt: new Date("2025-09-08T23:29:27.206Z"),
  updatedAt: new Date("2025-09-08T23:29:27.206Z"),
};

// Utiliser cette commande curl pour mettre à jour l'application :
const curlCommand = `curl -X PATCH "http://localhost:3001/api/v1/dashboard-applications/${applicationId}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "selectedPlan": ${JSON.stringify(selectedPlan, null, 2).replace(
      /\n/g,
      "\\n"
    )}
  }'`;

console.log("Commande à exécuter :");
console.log(curlCommand);
