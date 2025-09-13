#!/usr/bin/env node
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const planId = new ObjectId('6890da00904708a3fd2c680b');
  const res = await db
    .collection('plans')
    .updateOne({ _id: planId }, { $set: { billingCycle: 'MONTHLY' } });
  console.log('matched', res.matchedCount, 'modified', res.modifiedCount);
  const p = await db.collection('plans').findOne({ _id: planId });
  console.log(p);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
