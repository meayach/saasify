const { MongoClient } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "saas-database";

async function main() {
  try {
    // Use connect method to connect to the server
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection("saasCustomerAdmins"); // Collection des utilisateurs

    // Compter tous les utilisateurs
    const totalUsers = await collection.countDocuments();
    console.log(`Total users created: ${totalUsers}`);

    // Compter par rôle
    const customers = await collection.countDocuments({ role: "customer" });
    const managers = await collection.countDocuments({ role: "manager" });
    const admins = await collection.countDocuments({ role: "admin" });

    console.log(`\nUsers by role:`);
    console.log(`- Customers: ${customers}`);
    console.log(`- Managers: ${managers}`);
    console.log(`- Admins: ${admins}`);

    // Afficher quelques exemples d'utilisateurs
    console.log(`\nSample users:`);
    const sampleUsers = await collection.find({}).limit(5).toArray();
    sampleUsers.forEach((user) => {
      console.log(
        `- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`
      );
    });

    // Afficher tous les utilisateurs par catégorie
    console.log(`\n=== ALL CUSTOMERS ===`);
    const allCustomers = await collection.find({ role: "customer" }).toArray();
    allCustomers.forEach((user) => {
      console.log(
        `${user.firstName} ${user.lastName} - ${user.email} - ${user.city}`
      );
    });

    console.log(`\n=== ALL MANAGERS ===`);
    const allManagers = await collection.find({ role: "manager" }).toArray();
    allManagers.forEach((user) => {
      console.log(
        `${user.firstName} ${user.lastName} - ${user.email} - ${user.city}`
      );
    });

    console.log(`\n=== ALL ADMINS ===`);
    const allAdmins = await collection.find({ role: "admin" }).toArray();
    allAdmins.forEach((user) => {
      console.log(
        `${user.firstName} ${user.lastName} - ${user.email} - ${user.city}`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

main().catch(console.error);
