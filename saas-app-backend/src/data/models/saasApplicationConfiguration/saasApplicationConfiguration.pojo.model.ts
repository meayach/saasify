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

  @AutoMap()
  @Prop({ required: true })
  applicationId: string;

  @AutoMap(() => SaasApplicationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  application?: SaasApplicationPOJO;

  @AutoMap()
  @Prop()
  applicationName?: string;

  @AutoMap()
  @Prop()
  domainName?: string;

  @AutoMap()
  @Prop()
  logoPath?: string;

  @AutoMap()
  @Prop({ default: true })
  isActive?: boolean;

  @AutoMap()
  @Prop({
    type: {
      paypal: { type: Boolean, default: false },
      wize: { type: Boolean, default: false },
      payonner: { type: Boolean, default: false },
    },
    default: {
      paypal: false,
      wize: false,
      payonner: false,
    },
  })
  paymentMethods?: {
    paypal: boolean;
    wize: boolean;
    payonner: boolean;
  };

  @AutoMap()
  @Prop()
  createdAt?: Date;

  @AutoMap()
  @Prop()
  updatedAt?: Date;

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
