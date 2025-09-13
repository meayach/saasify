#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();
const { ObjectId } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/saas-database';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const apps = await db.collection('SaasApplications').find({}).toArray();
  console.log('Found apps:', apps.length);
  let total = 0;
  for (const a of apps) {
    let resolved = 0;
    let reason = 'none';
    // 1) embedded selectedPlan
    if (
      a.selectedPlan &&
      a.selectedPlan.price &&
      String((a.selectedPlan.billingCycle || '').toUpperCase()) === 'MONTHLY'
    ) {
      resolved = Number(a.selectedPlan.price) || 0;
      reason = 'selectedPlan';
    } else if (a.defaultPlanId) {
      // lookup raw plans by id
      const pid =
        typeof a.defaultPlanId === 'object' && a.defaultPlanId._bsontype
          ? a.defaultPlanId
          : new ObjectId(a.defaultPlanId);
      const p = await db.collection('plans').findOne({ _id: pid });
      if (p && String((p.billingCycle || p.billing || '').toUpperCase()) === 'MONTHLY' && p.price) {
        resolved = Number(p.price) || 0;
        reason = `defaultPlanId:${p._id.toString()}`;
      } else {
        // not monthly or not found
        reason = 'defaultPlanId-not-monthly-or-missing';
      }
    } else {
      // try plans by application
      try {
        const plist = await db
          .collection('plans')
          .find({ applicationId: a._id.toString() })
          .toArray();
        const chosen =
          plist.find(
            (pl) =>
              pl.isActive &&
              String((pl.billingCycle || pl.billing || '').toUpperCase()) === 'MONTHLY',
          ) ||
          plist.find(
            (pl) => String((pl.billingCycle || pl.billing || '').toUpperCase()) === 'MONTHLY',
          ) ||
          null;
        if (chosen && chosen.price) {
          resolved = Number(chosen.price) || 0;
          reason = `plans-list:${chosen._id.toString()}`;
        } else {
          reason = 'no-plan-monthly-found';
        }
      } catch (e) {
        reason = 'plans-query-error';
      }
    }
    console.log('App', a._id.toString(), 'name:', a.name, '=>', resolved, '€ (', reason, ')');
    total += resolved;
  }
  console.log('TOTAL monthly resolved sum =', total, '€');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
