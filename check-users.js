const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

async function main() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");

    // Vérifier saas-database
    console.log("\n=== SAAS-DATABASE ===");
    const db1 = client.db("saas-database");
    const collection1 = db1.collection("saasCustomerAdmins");
    const count1 = await collection1.countDocuments();
    console.log(`Total users in saas-database: ${count1}`);

    if (count1 > 0) {
      const users1 = await collection1.find({}).sort({ email: 1 }).toArray();

      const customers1 = users1.filter((user) => user.role === "customer");
      const managers1 = users1.filter((user) => user.role === "manager");
      const admins1 = users1.filter((user) => user.role === "admin");

      console.log(`\nCustomers (${customers1.length}):`);
      customers1.forEach((user) => {
        console.log(
          `  - ${user.firstName} ${user.lastName} (${user.email}) - ${
            user.city || "N/A"
          }`
        );
      });

      console.log(`\nManagers (${managers1.length}):`);
      managers1.forEach((user) => {
        console.log(
          `  - ${user.firstName} ${user.lastName} (${user.email}) - ${
            user.city || "N/A"
          }`
        );
      });

      console.log(`\nAdmins (${admins1.length}):`);
      admins1.forEach((user) => {
        console.log(
          `  - ${user.firstName} ${user.lastName} (${user.email}) - ${
            user.city || "N/A"
          }`
        );
      });
    }

    // Vérifier saas_db
    console.log("\n\n=== SAAS_DB ===");
    const db2 = client.db("saas_db");
    const collection2 = db2.collection("SaasCustomerAdmin");
    const count2 = await collection2.countDocuments();
    console.log(`Total users in saas_db: ${count2}`);

    if (count2 > 0) {
      const users2 = await collection2.find({}).sort({ email: 1 }).toArray();
      console.log("\nAll users in saas_db:");
      users2.forEach((user) => {
        console.log(
          `  - ${user.firstName || "N/A"} ${user.lastName || "N/A"} (${
            user.email
          }) - Role: ${user.role || "N/A"}`
        );
      });
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total users across both databases: ${count1 + count2}`);

    if (count1 > 0) {
      const allUsers = await collection1.find({}).toArray();
      const totalCustomers = allUsers.filter(
        (user) => user.role === "customer"
      ).length;
      const totalManagers = allUsers.filter(
        (user) => user.role === "manager"
      ).length;
      const totalAdmins = allUsers.filter(
        (user) => user.role === "admin"
      ).length;

      console.log(`Customers: ${totalCustomers}`);
      console.log(`Managers: ${totalManagers}`);
      console.log(`Admins: ${totalAdmins}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
