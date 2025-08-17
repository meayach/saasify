import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ApplicationConfiguration extends Document {
  @Prop({ required: true, unique: true })
  applicationId: string;

  @Prop()
  applicationName: string;

  @Prop()
  domainName: string;

  @Prop()
  logoPath: string;

  @Prop({ default: true })
  isActive: boolean;

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
  paymentMethods: {
    paypal: boolean;
    wize: boolean;
    payonner: boolean;
  };
}

export const ApplicationConfigurationSchema =
  SchemaFactory.createForClass(ApplicationConfiguration);
