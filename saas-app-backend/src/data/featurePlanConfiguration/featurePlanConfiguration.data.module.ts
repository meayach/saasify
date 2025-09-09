import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FeaturePlanConfigurationPOJO,
  FeaturePlanConfigurationSchema,
} from '../models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';
import { FeaturePlanConfigurationRepository } from './repository/featurePlanConfiguration.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FeaturePlanConfigurationPOJO.name,
        schema: FeaturePlanConfigurationSchema,
      },
    ]),
  ],
  providers: [FeaturePlanConfigurationRepository],
  exports: [FeaturePlanConfigurationRepository],
})
export class FeaturePlanConfigurationDataModule {}
