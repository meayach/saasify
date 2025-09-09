import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasApplicationFeature,
  SaasApplicationFeatureSchema,
} from '../data/models/saasApplicationFeature.model';
import {
  SaasPlanFeatureValue,
  SaasPlanFeatureValueSchema,
} from '../data/models/saasPlanFeatureValue.model';
import { SaasApplicationFeatureService } from '../services/saasApplicationFeature.service';
import { SaasPlanFeatureValueService } from '../services/saasPlanFeatureValue.service';
import {
  SaasApplicationFeatureController,
  FeatureUtilsController,
} from '../controllers/saasApplicationFeature.controller';
import { SaasPlanFeatureValueController } from '../controllers/saasPlanFeatureValue.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaasApplicationFeature.name, schema: SaasApplicationFeatureSchema },
      { name: SaasPlanFeatureValue.name, schema: SaasPlanFeatureValueSchema },
    ]),
  ],
  controllers: [
    SaasApplicationFeatureController,
    FeatureUtilsController,
    SaasPlanFeatureValueController,
  ],
  providers: [SaasApplicationFeatureService, SaasPlanFeatureValueService],
  exports: [SaasApplicationFeatureService, SaasPlanFeatureValueService],
})
export class FeatureManagementModule {}
