import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasPricingPOJO } from '../saasPricing/saasPricing.pojo.model';
import { SaasApplicationPOJO } from '../saasApplication/saasApplication.pojo.model';
import { SaasPlanPOJO } from '../saasPlan/saasPlan.pojo.model';

export type SaasFeatureDocument = SaasFeaturePOJO & Document;

@Schema()
export class SaasFeaturePOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop()
  name: string;

  @AutoMap()
  @Prop()
  roleId: string;

  @AutoMap(() => SaasApplicationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  application?: SaasApplicationPOJO;
}

export const SaasFeatureSchema = SchemaFactory.createForClass(SaasFeaturePOJO);
