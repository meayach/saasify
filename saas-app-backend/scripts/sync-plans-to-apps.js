#!/usr/bin/env node
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

async function run() {
  console.log('Connecting to', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;

  const candidateCollections = [
    'SaasPlans',
    'saasplans',
    'plans',
    'saasPlan',
    'saasPlans',
    'pricing',
    'pricingPlans',
  ];
  let plans = [];
  for (const col of candidateCollections) {
    try {
      const docs = await db.collection(col).find({}).toArray();
      if (docs && docs.length) {
        console.log(`Found ${docs.length} plans in collection ${col}`);
        plans = plans.concat(docs);
      } else {
        console.log(`No plans in collection ${col}`);
      }
    } catch (e) {
      // ignore missing collection errors
      // console.log('collection missing', col);
    }
  }
  console.log('Total plans found:', plans.length);

  // Group plans by applicationId
  const byApp = {};
  for (const p of plans) {
    console.log(
      'Plan:',
      p._id.toString(),
      'name:',
      p.name || p.title || p.displayName,
      'price:',
      p.price,
      'billingCycle:',
      p.billingCycle || p.billing,
      'applicationId:',
      p.applicationId || p.application || p.application?._id,
    );
    const appId = p.applicationId
      ? p.applicationId.toString()
      : p.application
      ? p.application._id
        ? p.application._id.toString()
        : p.application.toString()
      : null;
    if (!appId) continue;
    byApp[appId] = byApp[appId] || [];
    byApp[appId].push(p._id);
  }

  const appIds = Object.keys(byApp);
  console.log('Applications with plans to update:', appIds.length);

  for (const appId of appIds) {
    const planIds = byApp[appId];
    const res = await db
      .collection('SaasApplications')
      .updateOne({ _id: new ObjectId(appId) }, { $set: { plans: planIds } });
    console.log('Updated app', appId, 'matched', res.matchedCount, 'modified', res.modifiedCount);
  }

  console.log('Done. Closing connection.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
