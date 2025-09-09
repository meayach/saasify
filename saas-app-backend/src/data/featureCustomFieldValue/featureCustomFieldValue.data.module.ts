import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FeatureCustomFieldValuePOJO,
  FeatureCustomFieldValueSchema,
} from '../models/featureCustomFieldValue/featureCustomFieldValue.pojo.model';
import { FeatureCustomFieldValueRepository } from './repository/featureCustomFieldValue.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FeatureCustomFieldValuePOJO.name,
        schema: FeatureCustomFieldValueSchema,
      },
    ]),
  ],
  providers: [FeatureCustomFieldValueRepository],
  exports: [FeatureCustomFieldValueRepository],
})
export class FeatureCustomFieldValueDataModule {}
