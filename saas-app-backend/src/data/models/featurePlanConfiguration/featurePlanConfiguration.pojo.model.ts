import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type FeaturePlanConfigurationDocument = FeaturePlanConfigurationPOJO & Document;

// Enum pour le statut de la fonctionnalité dans le plan
export enum FeatureStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  LIMITED = 'limited',
  UNLIMITED = 'unlimited',
}

@Schema({ timestamps: true })
export class FeaturePlanConfigurationPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

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
    ref: 'FeaturePOJO',
  })
  featureId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ type: String, enum: FeatureStatus, required: true })
  status: FeatureStatus;

  @AutoMap()
  @Prop({ default: {} })
  metadata: Record<string, any>; // Configuration spécifique au plan

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ default: 0 })
  sortOrder: number; // Ordre d'affichage dans le plan

  @AutoMap()
  @Prop({ default: '' })
  customDisplayName: string; // Nom d'affichage personnalisé pour ce plan

  @AutoMap()
  @Prop({ default: '' })
  customDescription: string; // Description personnalisée pour ce plan

  @AutoMap()
  @Prop({ default: false })
  isHighlighted: boolean; // Mettre en avant cette fonctionnalité

  @AutoMap()
  @Prop({ default: '' })
  highlightText: string; // Texte de mise en avant (ex: "Nouveau!", "Populaire!")

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  applicationId: mongoose.Schema.Types.ObjectId; // Pour éviter les fuites inter-tenant

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}

export const FeaturePlanConfigurationSchema = SchemaFactory.createForClass(
  FeaturePlanConfigurationPOJO,
);

// Index pour optimiser les requêtes
FeaturePlanConfigurationSchema.index({ planId: 1, isActive: 1 });
FeaturePlanConfigurationSchema.index({ featureId: 1, isActive: 1 });
FeaturePlanConfigurationSchema.index({ applicationId: 1, planId: 1 });
FeaturePlanConfigurationSchema.index({ planId: 1, sortOrder: 1 });
FeaturePlanConfigurationSchema.index({ planId: 1, featureId: 1 }, { unique: true }); // Pas de doublons
