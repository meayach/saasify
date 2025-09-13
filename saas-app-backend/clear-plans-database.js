const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/saasApp';

async function clearPlansDatabase() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Collections possibles pour les plans
    const collections = ['plans', 'saasPlan', 'saasPlans', 'pricing', 'pricingPlans'];
    
    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          console.log(`📊 Collection "${collectionName}" trouvée avec ${count} documents`);
          
          // Afficher les plans existants
          const existingPlans = await collection.find({}).toArray();
          console.log('Plans existants:');
          existingPlans.forEach((plan, index) => {
            console.log(`  ${index + 1}. ${plan.name} - ${plan.price}€/${plan.billingCycle}`);
          });
          
          // Supprimer tous les plans
          const result = await collection.deleteMany({});
          console.log(`🗑️ ${result.deletedCount} plans supprimés de la collection "${collectionName}"`);
        } else {
          console.log(`✅ Collection "${collectionName}" vide ou inexistante`);
        }
      } catch (error) {
        console.log(`⚠️ Collection "${collectionName}" n'existe pas`);
      }
    }
    
    console.log('\n✅ Nettoyage terminé. Le backend utilisera maintenant les plans de fallback définis dans le code.');
    console.log('🔄 Redémarrez le frontend pour voir les nouveaux plans.');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
clearPlansDatabase().catch(console.error);
