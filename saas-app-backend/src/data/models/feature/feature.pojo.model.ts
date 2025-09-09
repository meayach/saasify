import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type FeatureDocument = FeaturePOJO & Document;

// Enum pour les rôles qui peuvent accéder à la fonctionnalité
export enum FeatureRole {
  SAAS_CUSTOMER_ADMIN = 'SAAS_CUSTOMER_ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  SUBSCRIBER = 'SUBSCRIBER',
  ALL = 'ALL', // Accessible à tous
}

// Enum pour les catégories de fonctionnalités
export enum FeatureCategory {
  STORAGE = 'storage',
  COMMUNICATION = 'communication',
  API = 'api',
  ANALYTICS = 'analytics',
  SUPPORT = 'support',
  SECURITY = 'security',
  INTEGRATION = 'integration',
  CUSTOMIZATION = 'customization',
  REPORTING = 'reporting',
  USER_MANAGEMENT = 'user_management',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class FeaturePOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, unique: true })
  name: string; // Nom unique de la fonctionnalité

  @AutoMap()
  @Prop({ default: '' })
  description: string; // Description détaillée

  @AutoMap()
  @Prop({ type: String, enum: FeatureCategory, required: true })
  category: FeatureCategory;

  @AutoMap()
  @Prop({ type: [String], enum: FeatureRole, default: [FeatureRole.ALL] })
  roles: FeatureRole[]; // Rôles autorisés à utiliser cette fonctionnalité

  @AutoMap()
  @Prop({ default: {} })
  metadata: Record<string, any>; // Métadonnées additionnelles

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ default: false })
  isGlobal: boolean; // Si true, disponible pour toutes les applications

  @AutoMap()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
    required: false,
  })
  applicationId?: mongoose.Schema.Types.ObjectId; // Si null et isGlobal=true, alors global

  @AutoMap()
  @Prop({ default: 0 })
  sortOrder: number; // Ordre d'affichage

  @AutoMap()
  @Prop({ default: '' })
  icon: string; // Icône pour l'affichage

  @AutoMap()
  @Prop({ default: '' })
  displayName: string; // Nom d'affichage (différent du nom technique)

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}

export const FeatureSchema = SchemaFactory.createForClass(FeaturePOJO);

// Index pour optimiser les requêtes
FeatureSchema.index({ applicationId: 1, isActive: 1 });
FeatureSchema.index({ category: 1, isActive: 1 });
FeatureSchema.index({ isGlobal: 1, isActive: 1 });
FeatureSchema.index({ sortOrder: 1 });
