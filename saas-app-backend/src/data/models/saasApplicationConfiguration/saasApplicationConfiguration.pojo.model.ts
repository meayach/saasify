import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasApplicationPOJO } from '../saasApplication/saasApplication.pojo.model';
import { SaasPaymentMethodConfigurationPOJO } from '../saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.pojo.model';

export type SaasApplicationConfigurationDocument = SaasApplicationConfigurationPOJO & Document;

@Schema()
export class SaasApplicationConfigurationPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap(() => SaasApplicationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  application?: SaasApplicationPOJO;

  @AutoMap(() => [SaasPaymentMethodConfigurationPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPaymentMethodConfigurationPOJO',
  })
  paymentMethodConfigurations?: SaasPaymentMethodConfigurationPOJO[];
}

export const SaasApplicationConfigurationSchema = SchemaFactory.createForClass(
  SaasApplicationConfigurationPOJO,
);
