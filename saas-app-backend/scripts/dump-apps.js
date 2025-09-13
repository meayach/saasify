#!/usr/bin/env node
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const apps = await db.collection('SaasApplications').find({}).limit(50).toArray();
  console.log('Found apps:', apps.length);
  for (const a of apps) {
    console.log(
      'App',
      a._id.toString(),
      'name:',
      a.name,
      'defaultPlanId:',
      a.defaultPlanId,
      'plansLength:',
      (a.plans || []).length,
    );
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
