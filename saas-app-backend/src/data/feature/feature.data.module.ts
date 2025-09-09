import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Import schemas
import { FeaturePOJO, FeatureSchema } from '../models/feature/feature.pojo.model';
import {
  FeatureCustomFieldPOJO,
  FeatureCustomFieldSchema,
} from '../models/featureCustomField/featureCustomField.pojo.model';
import {
  FeaturePlanConfigurationPOJO,
  FeaturePlanConfigurationSchema,
} from '../models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';
import {
  FeatureCustomFieldValuePOJO,
  FeatureCustomFieldValueSchema,
} from '../models/featureCustomFieldValue/featureCustomFieldValue.pojo.model';
import {
  SubscriptionConsumptionPOJO,
  SubscriptionConsumptionSchema,
} from '../models/subscriptionConsumption/subscriptionConsumption.pojo.model';

// Import repositories
import { FeatureRepository } from './repository/feature.repository';
import { FeatureCustomFieldRepository } from '../featureCustomField/repository/featureCustomField.repository';
import { FeaturePlanConfigurationRepository } from '../featurePlanConfiguration/repository/featurePlanConfiguration.repository';
import { FeatureCustomFieldValueRepository } from '../featureCustomFieldValue/repository/featureCustomFieldValue.repository';
import { SubscriptionConsumptionRepository } from '../subscriptionConsumption/repository/subscriptionConsumption.repository';

// Import services
import { FeatureService } from '../../services/feature/feature.service';
import { PlanFeatureService } from '../../services/planFeature/planFeature.service';
import { FeatureMigrationService } from '../../services/featureMigration/featureMigration.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeaturePOJO.name, schema: FeatureSchema },
      { name: FeatureCustomFieldPOJO.name, schema: FeatureCustomFieldSchema },
      { name: FeaturePlanConfigurationPOJO.name, schema: FeaturePlanConfigurationSchema },
      { name: FeatureCustomFieldValuePOJO.name, schema: FeatureCustomFieldValueSchema },
      { name: SubscriptionConsumptionPOJO.name, schema: SubscriptionConsumptionSchema },
    ]),
  ],
  providers: [
    // Repositories
    FeatureRepository,
    FeatureCustomFieldRepository,
    FeaturePlanConfigurationRepository,
    FeatureCustomFieldValueRepository,
    SubscriptionConsumptionRepository,

    // Services
    FeatureService,
    PlanFeatureService,
    FeatureMigrationService,
  ],
  exports: [
    // Export repositories for use in other modules
    FeatureRepository,
    FeatureCustomFieldRepository,
    FeaturePlanConfigurationRepository,
    FeatureCustomFieldValueRepository,
    SubscriptionConsumptionRepository,

    // Export services for use in other modules
    FeatureService,
    PlanFeatureService,
    FeatureMigrationService,
  ],
})
export class FeatureDataModule {}
