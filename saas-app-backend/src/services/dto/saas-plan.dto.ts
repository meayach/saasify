import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType, BillingCycle } from '../../data/models/saasPlan/saas-plan.model';

export class CreateSaasPlanDto {
  @ApiProperty({ description: 'Plan name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Plan description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: PlanType, description: 'Plan type' })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiProperty({ enum: BillingCycle, description: 'Billing cycle' })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({ description: 'Plan price' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Currency ID' })
  @IsMongoId()
  currencyId: string;

  @ApiProperty({ description: 'Application ID' })
  @IsMongoId()
  applicationId: string;

  @ApiPropertyOptional({ description: 'Is plan popular' })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ description: 'Plan features' })
  @IsOptional()
  features?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Plan limits' })
  @IsOptional()
  limits?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Included features', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedFeatures?: string[];

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateSaasPlanDto {
  @ApiPropertyOptional({ description: 'Plan name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Plan price' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Is plan active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is plan popular' })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ description: 'Plan features' })
  @IsOptional()
  features?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Plan limits' })
  @IsOptional()
  limits?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Included features', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedFeatures?: string[];

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class SaasPlanResponseDto {
  @ApiProperty({ description: 'Plan ID' })
  id: string;

  @ApiProperty({ description: 'Plan name' })
  name: string;

  @ApiProperty({ description: 'Plan description' })
  description: string;

  @ApiProperty({ enum: PlanType, description: 'Plan type' })
  type: PlanType;

  @ApiProperty({ enum: BillingCycle, description: 'Billing cycle' })
  billingCycle: BillingCycle;

  @ApiProperty({ description: 'Plan price' })
  price: number;

  @ApiProperty({ description: 'Currency information' })
  currency: {
    id: string;
    code: string;
    symbol: string;
  };

  @ApiProperty({ description: 'Is plan active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is plan popular' })
  isPopular: boolean;

  @ApiProperty({ description: 'Included features', type: [String] })
  includedFeatures: string[];

  @ApiProperty({ description: 'Plan creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Plan last update date' })
  updatedAt: Date;
}
