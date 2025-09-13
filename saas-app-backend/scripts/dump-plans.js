#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const plans = await db.collection('plans').find({}).toArray();
  console.log('Found plans:', plans.length);
  for (const p of plans) {
    console.log(
      'Plan',
      p._id.toString(),
      'name:',
      p.name,
      'price:',
      p.price,
      'billingCycle:',
      p.billingCycle || p.billing || p.interval || null,
    );
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
