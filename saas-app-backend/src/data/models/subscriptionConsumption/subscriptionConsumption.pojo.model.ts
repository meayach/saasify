import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type SubscriptionConsumptionDocument = SubscriptionConsumptionPOJO & Document;

// Enum pour les périodes de consommation
export enum ConsumptionPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
  CURRENT_BILLING_CYCLE = 'current_billing_cycle',
}

@Schema({ timestamps: true })
export class SubscriptionConsumptionPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasSubscriptionPOJO',
  })
  subscriptionId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeaturePOJO',
  })
  featureId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeatureCustomFieldPOJO',
  })
  customFieldId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, default: 0 })
  consumptionValue: number; // Valeur consommée (ex: 25 emails envoyés)

  @AutoMap()
  @Prop({ required: true, default: 0 })
  limitValue: number; // Limite autorisée (-1 pour illimité)

  @AutoMap()
  @Prop({ type: String, enum: ConsumptionPeriod, required: true })
  period: ConsumptionPeriod;

  @AutoMap()
  @Prop({ required: true })
  periodStart: Date; // Début de la période de consommation

  @AutoMap()
  @Prop({ required: true })
  periodEnd: Date; // Fin de la période de consommation

  @AutoMap()
  @Prop({ default: false })
  isLimitExceeded: boolean; // Flag pour identifier rapidement les dépassements

  @AutoMap()
  @Prop({ default: null })
  lastResetDate: Date; // Date du dernier reset de consommation

  @AutoMap()
  @Prop({ default: null })
  nextResetDate: Date; // Date du prochain reset

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  applicationId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPlanPOJO',
  })
  planId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasSubscriberPOJO',
  })
  subscriberId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ default: {} })
  metadata: Record<string, any>; // Métadonnées additionnelles (ex: détails des usages)

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}

export const SubscriptionConsumptionSchema = SchemaFactory.createForClass(
  SubscriptionConsumptionPOJO,
);

// Index pour optimiser les requêtes
SubscriptionConsumptionSchema.index({ subscriptionId: 1, featureId: 1 });
SubscriptionConsumptionSchema.index({ subscriberId: 1, period: 1 });
SubscriptionConsumptionSchema.index({ applicationId: 1, periodStart: 1, periodEnd: 1 });
SubscriptionConsumptionSchema.index({ isLimitExceeded: 1, isActive: 1 });
SubscriptionConsumptionSchema.index({ nextResetDate: 1, isActive: 1 });
SubscriptionConsumptionSchema.index(
  { subscriptionId: 1, featureId: 1, customFieldId: 1, period: 1, periodStart: 1 },
  { unique: true },
); // Pas de doublons pour une même période
