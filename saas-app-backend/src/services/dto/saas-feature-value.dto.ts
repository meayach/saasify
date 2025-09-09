import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsMongoId,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  FeatureUnit,
  FeatureType,
} from '../../data/models/saasFeatureValue/saasFeatureValue.pojo.model';

export class CreateSaasFeatureValueDto {
  @ApiProperty({ description: 'Nom de la fonctionnalité' })
  @IsString()
  @IsNotEmpty()
  featureName: string;

  @ApiProperty({ description: 'Description de la fonctionnalité' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: FeatureType,
    description: 'Type de fonctionnalité (limit, quota, boolean, access)',
  })
  @IsEnum(FeatureType)
  featureType: FeatureType;

  @ApiProperty({
    enum: FeatureUnit,
    description: 'Unité de mesure de la fonctionnalité',
  })
  @IsEnum(FeatureUnit)
  unit: FeatureUnit;

  @ApiProperty({
    description: 'Valeur de la fonctionnalité (-1 pour illimité)',
    minimum: -1,
  })
  @IsNumber()
  @Min(-1)
  value: number;

  @ApiProperty({
    description: "Valeur d'affichage personnalisée",
    required: false,
  })
  @IsOptional()
  @IsString()
  displayValue?: string;

  @ApiProperty({ description: "ID de l'application SaaS" })
  @IsMongoId()
  @IsNotEmpty()
  saasApplicationId: string;

  @ApiProperty({ description: 'ID du plan SaaS' })
  @IsMongoId()
  @IsNotEmpty()
  saasPlanId: string;

  @ApiProperty({
    description: 'Si la fonctionnalité est active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: "Ordre d'affichage",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class UpdateSaasFeatureValueDto {
  @ApiProperty({
    description: 'Nom de la fonctionnalité',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  featureName?: string;

  @ApiProperty({
    description: 'Description de la fonctionnalité',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: FeatureType,
    description: 'Type de fonctionnalité',
    required: false,
  })
  @IsOptional()
  @IsEnum(FeatureType)
  featureType?: FeatureType;

  @ApiProperty({
    enum: FeatureUnit,
    description: 'Unité de mesure',
    required: false,
  })
  @IsOptional()
  @IsEnum(FeatureUnit)
  unit?: FeatureUnit;

  @ApiProperty({
    description: 'Valeur de la fonctionnalité',
    required: false,
    minimum: -1,
  })
  @IsOptional()
  @IsNumber()
  @Min(-1)
  value?: number;

  @ApiProperty({
    description: "Valeur d'affichage personnalisée",
    required: false,
  })
  @IsOptional()
  @IsString()
  displayValue?: string;

  @ApiProperty({
    description: 'Si la fonctionnalité est active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: "Ordre d'affichage",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class SaasFeatureValueResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  featureName: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: FeatureType })
  featureType: FeatureType;

  @ApiProperty({ enum: FeatureUnit })
  unit: FeatureUnit;

  @ApiProperty()
  value: number;

  @ApiProperty()
  displayValue: string;

  @ApiProperty()
  saasApplication: string;

  @ApiProperty()
  saasPlan: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BulkCreateFeatureValuesDto {
  @ApiProperty({
    type: [CreateSaasFeatureValueDto],
    description: 'Liste des valeurs de fonctionnalités à créer',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaasFeatureValueDto)
  @IsNotEmpty()
  featureValues: CreateSaasFeatureValueDto[];
}
