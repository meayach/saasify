import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ApplicationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ApplicationType {
  WEB_APP = 'WEB_APP',
  MOBILE_APP = 'MOBILE_APP',
  API_SERVICE = 'API_SERVICE',
  DESKTOP_APP = 'DESKTOP_APP',
}

@Schema({ timestamps: true })
export class SaasApplication extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ApplicationStatus, default: ApplicationStatus.DEVELOPMENT })
  status: ApplicationStatus;

  @Prop({ type: String, enum: ApplicationType, required: true })
  type: ApplicationType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  logoUrl: string;

  @Prop()
  websiteUrl: string;

  @Prop()
  apiUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'SaasPlan', required: false })
  defaultPlan?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object })
  settings: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Date })
  launchedAt: Date;
}

export const SaasApplicationSchema = SchemaFactory.createForClass(SaasApplication);
