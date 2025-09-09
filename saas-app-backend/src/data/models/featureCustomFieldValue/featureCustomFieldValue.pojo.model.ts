import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type FeatureCustomFieldValueDocument = FeatureCustomFieldValuePOJO & Document;

@Schema({ timestamps: true })
export class FeatureCustomFieldValuePOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeaturePlanConfigurationPOJO',
  })
  featurePlanConfigurationId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeatureCustomFieldPOJO',
  })
  customFieldId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  fieldValue: any; // Valeur du champ (-1 pour illimité selon votre spec)

  @AutoMap()
  @Prop({ default: '' })
  displayValue: string; // Valeur formatée pour l'affichage (ex: "Illimité", "10 emails/mois")

  @AutoMap()
  @Prop({ default: false })
  isUnlimited: boolean; // Flag pour identifier facilement les valeurs illimitées

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  applicationId: mongoose.Schema.Types.ObjectId; // Pour éviter les fuites inter-tenant

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPlanPOJO',
  })
  planId: mongoose.Schema.Types.ObjectId; // Dénormalisation pour les requêtes rapides

  @AutoMap()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeaturePOJO',
  })
  featureId: mongoose.Schema.Types.ObjectId; // Dénormalisation pour les requêtes rapides

  @AutoMap()
  @Prop({ default: {} })
  metadata: Record<string, any>; // Métadonnées additionnelles

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}

export const FeatureCustomFieldValueSchema = SchemaFactory.createForClass(
  FeatureCustomFieldValuePOJO,
);

// Index pour optimiser les requêtes
FeatureCustomFieldValueSchema.index({ featurePlanConfigurationId: 1 });
FeatureCustomFieldValueSchema.index({ planId: 1, featureId: 1 });
FeatureCustomFieldValueSchema.index({ applicationId: 1, planId: 1 });
FeatureCustomFieldValueSchema.index({ customFieldId: 1, planId: 1 });
FeatureCustomFieldValueSchema.index(
  { featurePlanConfigurationId: 1, customFieldId: 1 },
  { unique: true },
); // Pas de doublons
