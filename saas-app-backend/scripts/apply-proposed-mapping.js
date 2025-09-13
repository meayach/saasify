#!/usr/bin/env node
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

const mapping = [
  { appId: '68a87819a0fc8740c83794c1', planId: '6890d9be904708a3fd2c6807' },
  { appId: '68a89338a0fc8740c837962b', planId: '6890d9be904708a3fd2c6807' },
  { appId: '68a89604a0fc8740c837966b', planId: '6890d9be904708a3fd2c6807' },
  { appId: '68a8978ca0fc8740c8379699', planId: '6890d9f7904708a3fd2c6809' },
  { appId: '68a89acaa0fc8740c8379742', planId: '68a472723c9bcbd29ef3c57f' },
  { appId: '68a8fb3774acabc9eca2263e', planId: '6890da00904708a3fd2c680b' },
  { appId: '68bf8637672919391891b067', planId: '6890d9f7904708a3fd2c6809' },
  { appId: '68c009881aa1692120dba046', planId: '6890d9f7904708a3fd2c6809' },
  { appId: '68c0ce6f78c50d6d09fb3528', planId: '6890da00904708a3fd2c680b' },
  { appId: '68c487ffd4c53c4f4b67ecd9', planId: '6890d9be904708a3fd2c6807' },
  { appId: '68c488d3d4c53c4f4b67ee79', planId: '6890d9be904708a3fd2c6807' },
  { appId: '68c49fdb7e89707f9f48e44b', planId: '6890da00904708a3fd2c680b' },
  { appId: '68c4a3467e89707f9f48e6bb', planId: '6890d9be904708a3fd2c6807' },
];

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  for (const m of mapping) {
    const appId = new ObjectId(m.appId);
    const planId = new ObjectId(m.planId);
    await db
      .collection('SaasApplications')
      .updateOne({ _id: appId }, { $set: { defaultPlanId: planId }, $addToSet: { plans: planId } });
    console.log('Updated', m.appId, '->', m.planId);
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
