import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasPaymentPOJO } from '../SaasPayment/SaasPayment.pojo.model';

export type SaasSubscriptionHistoryDocument = SaasSubscriptionHistoryPOJO & Document;

type PaymentStatus = 'INIT' | 'COMPLETE' | 'CANCLED';

@Schema()
export class SaasSubscriptionHistoryPOJO {
  @AutoMap()
  _id: mongoose.ObjectId;

  @Prop()
  @AutoMap()
  status: PaymentStatus;

  @Prop()
  @AutoMap()
  orderId: string;

  // relation to one LandingPage

  // relation to one Subscription

  // relation to one Payment
  @AutoMap(() => SaasPaymentPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPaymentPOJO',
  })
  Payment?: SaasPaymentPOJO;
}

export const SaasSubscriptionHistorySchema = SchemaFactory.createForClass(
  SaasSubscriptionHistoryPOJO,
);
