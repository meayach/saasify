import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FeatureCustomFieldPOJO,
  FeatureCustomFieldSchema,
} from '../models/featureCustomField/featureCustomField.pojo.model';
import { FeatureCustomFieldRepository } from './repository/featureCustomField.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeatureCustomFieldPOJO.name, schema: FeatureCustomFieldSchema },
    ]),
  ],
  providers: [FeatureCustomFieldRepository],
  exports: [FeatureCustomFieldRepository],
})
export class FeatureCustomFieldDataModule {}
