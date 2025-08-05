import { IsString, IsNumber, IsArray, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateBillingSettingsDto {
  @IsString()
  defaultCurrency: string;

  @IsNumber()
  taxRate: number;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsArray()
  paymentMethods: string[];

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @IsOptional()
  @IsNumber()
  invoiceDueDays?: number;
}

export class UpdateBillingSettingsDto {
  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsArray()
  paymentMethods?: string[];

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @IsOptional()
  @IsNumber()
  invoiceDueDays?: number;
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsEnum(['month', 'year'])
  interval: 'month' | 'year';

  @IsArray()
  features: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  maxApplications?: number;

  @IsOptional()
  @IsBoolean()
  hasApiAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAdvancedAnalytics?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPrioritySupport?: boolean;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(['month', 'year'])
  interval?: 'month' | 'year';

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
