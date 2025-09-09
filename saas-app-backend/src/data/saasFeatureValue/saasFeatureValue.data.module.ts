import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasFeatureValuePOJO,
  SaasFeatureValueSchema,
} from '../models/saasFeatureValue/saasFeatureValue.pojo.model';
import { SaasFeatureValueRepository } from './repository/saasFeatureValue.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaasFeatureValuePOJO.name, schema: SaasFeatureValueSchema },
    ]),
  ],
  providers: [SaasFeatureValueRepository],
  exports: [SaasFeatureValueRepository],
})
export class SaasFeatureValueDataModule {}
