import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasPaymentMethodConfigurationPOJO } from '../saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.pojo.model';
import { SaasPricingPOJO } from '../saasPricing/saasPricing.pojo.model';
import { SaasSubscriptionHistoryPOJO } from '../SaaSubscriptionHistory/SaasSubscriptionHistory.pojo.model';

export type SaasPaymentDocument = SaasPaymentPOJO & Document;

@Schema()
export class SaasPaymentPOJO {
  @AutoMap()
  _id: mongoose.ObjectId;

  // make a type for payment method with only the posssible payment methods
  @AutoMap()
  @Prop()
  paymentMethod: string;

  // relation to one SubsriptionHistory
  @AutoMap(() => SaasSubscriptionHistoryPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasSubscriptionHistoryPOJO',
  })
  subscriptionHistory?: SaasSubscriptionHistoryPOJO;

  // relation to one Pricing
  @AutoMap(() => SaasPricingPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPricingPOJO',
  })
  price?: SaasPricingPOJO;

  // relation to one PaymentMethodConfiguration
  @AutoMap(() => SaasPaymentMethodConfigurationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPaymentMethodConfigurationPOJO',
  })
  paymentMethodConfig?: SaasPaymentMethodConfigurationPOJO;
}

export const SaasPaymentchema = SchemaFactory.createForClass(SaasPaymentPOJO);
