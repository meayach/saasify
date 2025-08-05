import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasWorkspaceConfigurationPOJO } from '../saasWorkspaceConfiguration/saasWorkspaceConfiguration.pojo.model';
import { SaasApplicationConfigurationPOJO } from '../saasApplicationConfiguration/saasApplicationConfiguration.pojo.model';

export type SaasPaymentMethodConfigurationDocument = SaasPaymentMethodConfigurationPOJO & Document;

@Schema()
export class SaasPaymentMethodConfigurationPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop()
  clientKey: string;

  @AutoMap()
  @Prop()
  provider: string;

  @AutoMap()
  @Prop()
  secretKey: string;

  @AutoMap(() => SaasWorkspaceConfigurationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasWorkspaceConfigurationPOJO',
  })
  workspaceConfiguration?: SaasWorkspaceConfigurationPOJO;

  @AutoMap(() => SaasApplicationConfigurationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationConfigurationPOJO',
  })
  applicationConfiguration?: SaasApplicationConfigurationPOJO;
}

export const SaasPaymentMethodConfigurationSchema = SchemaFactory.createForClass(
  SaasPaymentMethodConfigurationPOJO,
);
