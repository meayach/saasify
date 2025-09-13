#!/usr/bin/env node
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';
const FALLBACK_PLAN_ID = new ObjectId('6890da00904708a3fd2c680b');

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const apps = await db.collection('SaasApplications').find({}).toArray();
  console.log('apps found', apps.length);
  for (const a of apps) {
    const appId = a._id;
    const plans = a.plans || [];
    let defaultPlan = null;
    if (plans.length > 0) {
      defaultPlan = plans[0];
    } else {
      defaultPlan = FALLBACK_PLAN_ID;
      // ensure fallback plan is in plans array
      await db
        .collection('SaasApplications')
        .updateOne({ _id: appId }, { $addToSet: { plans: FALLBACK_PLAN_ID } });
    }
    await db
      .collection('SaasApplications')
      .updateOne({ _id: appId }, { $set: { defaultPlanId: defaultPlan } });
    console.log('app', appId.toString(), 'set defaultPlanId', defaultPlan.toString());
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
