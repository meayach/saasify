import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { AutoMap } from '@automapper/classes';

export type SaasPlanFeatureValueDocument = SaasPlanFeatureValue & Document;

@Schema({
  timestamps: true,
  collection: 'saas_plan_feature_values',
})
export class SaasPlanFeatureValue {
  @AutoMap()
  _id?: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  planId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  featureId: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  applicationId: mongoose.Schema.Types.ObjectId;

  // Valeur de la fonctionnalité (-1 pour illimité)
  @AutoMap()
  @Prop({ required: true })
  value: number;

  // Indicateur pour savoir si c'est illimité
  @AutoMap()
  @Prop({ default: false })
  isUnlimited: boolean;

  // Valeur textuelle pour affichage (ex: "10 emails", "illimité")
  @AutoMap()
  @Prop({ trim: true })
  displayValue?: string;

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  metadata: Record<string, any>;

  @AutoMap()
  createdAt?: Date;

  @AutoMap()
  updatedAt?: Date;
}

export const SaasPlanFeatureValueSchema = SchemaFactory.createForClass(SaasPlanFeatureValue);

// Index pour optimiser les requêtes
SaasPlanFeatureValueSchema.index({ planId: 1, featureId: 1 }, { unique: true });
SaasPlanFeatureValueSchema.index({ applicationId: 1, planId: 1 });
SaasPlanFeatureValueSchema.index({ featureId: 1 });
