import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SaasCustomerAdminDocument = SaasCustomerAdmin & Document;

@Schema({ collection: 'saasCustomerAdmins', timestamps: true })
export class SaasCustomerAdmin {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  streetAddress: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  zipCode: number;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  plan: string;

  @Prop({ required: true, enum: ['customer', 'admin', 'manager'] })
  role: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SaasCustomerAdminSchema = SchemaFactory.createForClass(SaasCustomerAdmin);
