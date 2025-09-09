import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type FeatureCustomFieldDocument = FeatureCustomFieldPOJO & Document;

// Enum pour les types de données des champs
export enum FieldDataType {
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ENUM = 'enum',
  JSON = 'json',
}

// Enum pour les unités (réutilise et étend FeatureUnit)
export enum FieldUnit {
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
  API_CALLS = 'api_calls',
  PROJECTS = 'projects',
  WORKSPACES = 'workspaces',

  // Unités de temps
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',
  YEARS = 'years',

  // Unités de bande passante
  MBPS = 'mbps',
  GBPS = 'gbps',

  // Unités de pourcentage et autres
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  NONE = 'none', // Pas d'unité
}

@Schema({ timestamps: true })
export class FeatureCustomFieldPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  fieldName: string; // Nom du champ (ex: "quota", "storage_limit")

  @AutoMap()
  @Prop({ default: '' })
  displayName: string; // Nom d'affichage (ex: "Quota mensuel")

  @AutoMap()
  @Prop({ default: '' })
  description: string; // Description du champ

  @AutoMap()
  @Prop({ type: String, enum: FieldDataType, required: true })
  dataType: FieldDataType;

  @AutoMap()
  @Prop({ type: String, enum: FieldUnit, default: FieldUnit.NONE })
  unit: FieldUnit;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeaturePOJO',
  })
  featureId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ default: null })
  defaultValue: any; // Valeur par défaut

  @AutoMap()
  @Prop({ default: null })
  minValue: number; // Valeur minimale (pour les nombres)

  @AutoMap()
  @Prop({ default: null })
  maxValue: number; // Valeur maximale (pour les nombres)

  @AutoMap()
  @Prop({ type: [String], default: [] })
  enumValues: string[]; // Valeurs possibles pour les enum

  @AutoMap()
  @Prop({ default: true })
  isRequired: boolean;

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ default: 0 })
  sortOrder: number; // Ordre d'affichage

  @AutoMap()
  @Prop({ default: {} })
  validationRules: Record<string, any>; // Règles de validation additionnelles

  @AutoMap()
  @Prop({ default: {} })
  metadata: Record<string, any>; // Métadonnées additionnelles

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}

export const FeatureCustomFieldSchema = SchemaFactory.createForClass(FeatureCustomFieldPOJO);

// Index pour optimiser les requêtes
FeatureCustomFieldSchema.index({ featureId: 1, isActive: 1 });
FeatureCustomFieldSchema.index({ featureId: 1, sortOrder: 1 });
FeatureCustomFieldSchema.index({ fieldName: 1, featureId: 1 }, { unique: true });
