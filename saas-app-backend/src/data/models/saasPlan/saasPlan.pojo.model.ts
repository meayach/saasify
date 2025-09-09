import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasApplicationPOJO } from '../saasApplication/saasApplication.pojo.model';
import { SaasPricingPOJO } from '../saasPricing/saasPricing.pojo.model';
import { SaasOfferPOJO } from '../saasOffer/saasOffer.pojo.model';

export type SaasPlanDocument = SaasPlanPOJO & Document;

// Enum pour les statuts du plan
export enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

// Enum pour les types de plans
export enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class SaasPlanPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  planName: string;

  @AutoMap()
  @Prop({ default: '' })
  description: string;

  @AutoMap()
  @Prop({ type: String, enum: PlanType, default: PlanType.BASIC })
  type: PlanType;

  @AutoMap()
  @Prop({ default: '' })
  groupId: string;

  @AutoMap()
  @Prop({ type: String, enum: PlanStatus, default: PlanStatus.ACTIVE })
  status: PlanStatus;

  @AutoMap()
  @Prop({ default: false })
  isPopular: boolean; // Pour mettre en avant un plan

  @AutoMap()
  @Prop({ default: 0 })
  sortOrder: number; // Ordre d'affichage

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  metadata: Record<string, any>; // Métadonnées additionnelles

  // OBLIGATOIRE : Lien vers l'application pour éviter les fuites inter-tenant
  @AutoMap(() => SaasApplicationPOJO)
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  application: SaasApplicationPOJO;

  @AutoMap(() => [SaasOfferPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasOfferPOJO',
  })
  offers?: SaasOfferPOJO[];

  // one to many
  @AutoMap(() => [SaasPricingPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPricingPOJO',
  })
  pricing?: SaasPricingPOJO[];

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}

export const SaasPlanSchema = SchemaFactory.createForClass(SaasPlanPOJO);

// Index pour optimiser les requêtes
SaasPlanSchema.index({ application: 1, status: 1 });
SaasPlanSchema.index({ application: 1, sortOrder: 1 });
SaasPlanSchema.index({ type: 1, status: 1 });
SaasPlanSchema.index({ isPopular: 1, status: 1 });
