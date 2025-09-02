import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaasPlanFeatureValueDto {
  @ApiProperty({ description: 'Plan ID' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ description: 'Feature ID' })
  @IsString()
  @IsNotEmpty()
  featureId: string;

  @ApiProperty({ description: 'Feature value (-1 for unlimited)' })
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ description: 'Is unlimited', default: false })
  @IsOptional()
  @IsBoolean()
  isUnlimited?: boolean;

  @ApiProperty({ description: 'Display value for the feature' })
  @IsString()
  @IsNotEmpty()
  displayValue: string;
}

export class UpdateSaasPlanFeatureValueDto {
  @ApiPropertyOptional({ description: 'Feature value (-1 for unlimited)' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Is unlimited' })
  @IsOptional()
  @IsBoolean()
  isUnlimited?: boolean;

  @ApiPropertyOptional({ description: 'Display value for the feature' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  displayValue?: string;
}

export class BulkUpdatePlanFeatureValuesDto {
  @ApiProperty({ description: 'Plan ID' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ 
    description: 'Feature values array',
    type: [CreateSaasPlanFeatureValueDto]
  })
  featureValues: Array<{
    featureId: string;
    value: number;
    isUnlimited?: boolean;
    displayValue: string;
  }>;
}