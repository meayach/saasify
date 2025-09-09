import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas_demo';
  console.log('Connecting to', mongoUri);
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;

  const offers = await db
    .collection('saasoffers')
    .find({ $or: [{ saasApplication: { $exists: false } }, { saasApplication: null }] })
    .toArray();
  console.log('Found orphan offers:', offers.length);

  if (offers.length === 0) {
    await mongoose.disconnect();
    console.log('No orphan offers, done.');
    return;
  }

  // backup
  const backupCol = db.collection('saas_offers_orphans_backup');
  const insertResult = await backupCol.insertMany(offers);
  console.log('Backed up', insertResult.insertedCount, 'documents to saas_offers_orphans_backup');

  // remove orphans
  const ids = offers.map((o: any) => o._id);
  const delResult = await db.collection('saasoffers').deleteMany({ _id: { $in: ids } });
  console.log('Deleted', delResult.deletedCount, 'orphan offers');

  await mongoose.disconnect();
  console.log('Done.');
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
