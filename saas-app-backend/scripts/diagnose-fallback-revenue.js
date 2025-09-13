#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();
const { ObjectId } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  // read applications
  const apps = await db.collection('SaasApplications').find({}).toArray();
  console.log('apps:', apps.length);
  let fallbackSum = 0;
  for (const a of apps) {
    if (a.selectedPlan && a.selectedPlan.price && a.selectedPlan.billingCycle === 'MONTHLY') {
      fallbackSum += Number(a.selectedPlan.price) || 0;
    }
  }
  const planIds = apps
    .map((a) => a.defaultPlanId)
    .filter((id) => !!id)
    .map((id) => (typeof id === 'object' && id._bsontype ? id : new ObjectId(id)));
  console.log('planIds from apps:', planIds.length);
  if (planIds.length > 0) {
    // try model lookup via registered model
    try {
      const mongooseLib = require('mongoose');
      const PlanModel = mongooseLib.model('SaasPlan');
      const referencedPlans = await PlanModel.find({ _id: { $in: planIds } })
        .lean()
        .exec();
      console.log('PlanModel referenced plans:', referencedPlans.length);
      for (const p of referencedPlans) {
        if (p && (p.billingCycle === 'MONTHLY' || p.billing === 'MONTHLY') && p.price)
          fallbackSum += Number(p.price) || 0;
      }
      if ((referencedPlans || []).length === 0) {
        const rawPlans = await db
          .collection('plans')
          .find({ _id: { $in: planIds } })
          .toArray();
        console.log('rawPlans found in collection plans:', rawPlans.length);
        for (const p of rawPlans) {
          if (p && (p.billingCycle === 'MONTHLY' || p.billing === 'MONTHLY') && p.price)
            fallbackSum += Number(p.price) || 0;
        }
      }
    } catch (e) {
      console.warn('Model lookup failed, trying raw plans collection', e.message || e);
      const rawPlans = await db
        .collection('plans')
        .find({ _id: { $in: planIds } })
        .toArray();
      console.log('rawPlans found in collection plans:', rawPlans.length);
      for (const p of rawPlans) {
        if (p && (p.billingCycle === 'MONTHLY' || p.billing === 'MONTHLY') && p.price)
          fallbackSum += Number(p.price) || 0;
      }
    }
  }
  console.log('Computed fallbackSum =', fallbackSum);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
