import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  website: string;

  @Prop()
  industry: string;

  @Prop({ default: 'Europe/Paris' })
  timezone: string;

  @Prop({ default: 'Français' })
  language: string;

  @Prop()
  logoUrl: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
