import { IsNotEmpty, IsString, IsMongoId, IsOptional, IsArray, ArrayUnique } from 'class-validator';

export class CreateSaasOfferDto {
  @IsNotEmpty()
  @IsString()
  offerName: string;

  @IsNotEmpty()
  @IsMongoId()
  saasApplicationId: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  plans?: string[];
}

export class SaasOfferResponseDto {
  _id: string;
  offerName: string;
  saasApplication?: any;
  plans?: any[];
}
