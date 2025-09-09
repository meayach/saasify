import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { AutoMap } from '@automapper/classes';

export type SaasApplicationFeatureDocument = SaasApplicationFeature & Document;

export enum FeatureType {
  NUMERIC = 'numeric',
  BOOLEAN = 'boolean',
  TEXT = 'text',
}

export enum FeatureUnit {
  // Stockage
  BYTES = 'bytes',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
  
  // Communications
  EMAILS = 'emails',
  SMS = 'sms',
  CALLS = 'calls',
  
  // API & Requests
  API_CALLS = 'api_calls',
  REQUESTS = 'requests',
  
  // Utilisateurs & Comptes
  USERS = 'users',
  ACCOUNTS = 'accounts',
  SEATS = 'seats',
  
  // Temps
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',
  
  // Quantités génériques
  ITEMS = 'items',
  PROJECTS = 'projects',
  FILES = 'files',
  
  // Aucune unité
  NONE = 'none',
}

@Schema({
  timestamps: true,
  collection: 'saas_application_features',
})
export class SaasApplicationFeature {
  @AutoMap()
  _id?: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, trim: true })
  name: string;

  @AutoMap()
  @Prop({ required: true, trim: true })
  description: string;

  @AutoMap()
  @Prop({ required: true, enum: FeatureType, default: FeatureType.NUMERIC })
  type: FeatureType;

  @AutoMap()
  @Prop({ required: true, enum: FeatureUnit, default: FeatureUnit.NONE })
  unit: FeatureUnit;

  @AutoMap()
  @Prop({ required: true })
  applicationId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ default: 0 })
  sortOrder: number;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  metadata: Record<string, any>;

  @AutoMap()
  createdAt?: Date;

  @AutoMap()
  updatedAt?: Date;
}

export const SaasApplicationFeatureSchema = SchemaFactory.createForClass(SaasApplicationFeature);

// Index pour optimiser les requêtes
SaasApplicationFeatureSchema.index({ applicationId: 1, sortOrder: 1 });
SaasApplicationFeatureSchema.index({ applicationId: 1, isActive: 1 });
