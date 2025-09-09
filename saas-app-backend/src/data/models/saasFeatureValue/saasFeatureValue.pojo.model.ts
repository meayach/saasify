import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type SaasFeatureValueDocument = SaasFeatureValuePOJO & Document;

// Enum pour les types d'unités
export enum FeatureUnit {
  // Unités de données
  BYTES = 'bytes',
  KILOBYTES = 'kb',
  MEGABYTES = 'mb',
  GIGABYTES = 'gb',
  TERABYTES = 'tb',

  // Unités de comptage
  COUNT = 'count',
  EMAILS = 'emails',
  USERS = 'users',
  REQUESTS = 'requests',
  TRANSACTIONS = 'transactions',

  // Unités de temps
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',

  // Unités de bande passante
  MBPS = 'mbps',
  GBPS = 'gbps',

  // Autres
  PERCENTAGE = 'percentage',
  UNLIMITED = 'unlimited',
}

// Enum pour les types de fonctionnalités
export enum FeatureType {
  LIMIT = 'limit', // Limite (ex: 10 emails/mois)
  QUOTA = 'quota', // Quota (ex: 5GB de stockage)
  BOOLEAN = 'boolean', // Activé/Désactivé (ex: Support 24/7)
  ACCESS = 'access', // Niveau d'accès (ex: API basique/complète)
}

@Schema({ timestamps: true })
export class SaasFeatureValuePOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  featureName: string; // Nom de la fonctionnalité (ex: "Emails par mois")

  @AutoMap()
  @Prop({ default: '' })
  description: string; // Description de la fonctionnalité

  @AutoMap()
  @Prop({ type: String, enum: FeatureType, required: true })
  featureType: FeatureType;

  @AutoMap()
  @Prop({ type: String, enum: FeatureUnit, required: true })
  unit: FeatureUnit;

  @AutoMap()
  @Prop({ required: true })
  value: number; // -1 pour illimité

  @AutoMap()
  @Prop({ default: '' })
  displayValue: string; // Valeur à afficher (ex: "Illimité", "10 emails/mois")

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  saasApplication: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPlanPOJO',
  })
  saasPlan: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ default: 0 })
  sortOrder: number; // Ordre d'affichage

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}

export const SaasFeatureValueSchema = SchemaFactory.createForClass(SaasFeatureValuePOJO);

// Index pour optimiser les requêtes
SaasFeatureValueSchema.index({ saasApplication: 1, saasPlan: 1 });
SaasFeatureValueSchema.index({ saasApplication: 1, isActive: 1 });
SaasFeatureValueSchema.index({ sortOrder: 1, featureName: 1 });
