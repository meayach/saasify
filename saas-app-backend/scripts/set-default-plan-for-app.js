#!/usr/bin/env node
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const appId = new ObjectId('68c4a3467e89707f9f48e6bb');
  const planId = new ObjectId('6890da00904708a3fd2c680b');
  const res = await db
    .collection('SaasApplications')
    .updateOne({ _id: appId }, { $set: { defaultPlanId: planId }, $addToSet: { plans: planId } });
  console.log('matched', res.matchedCount, 'modified', res.modifiedCount);
  const app = await db.collection('SaasApplications').findOne({ _id: appId });
  console.log(app);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
