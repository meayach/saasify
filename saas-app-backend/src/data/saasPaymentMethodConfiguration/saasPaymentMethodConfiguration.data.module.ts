import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  SaasPaymentMethodConfigurationPOJO,
  SaasPaymentMethodConfigurationSchema,
} from '@Data/models/saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.pojo.model';
import { SaasPaymentMethodConfigurationRepository } from './repository/saasPaymentMethodConfiguration.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasPaymentMethodConfigurationPOJO.name,
        schema: SaasPaymentMethodConfigurationSchema,
        collection: 'SaasPaymentMethodConfigurations',
      },
    ]),
  ],
  providers: [SaasPaymentMethodConfigurationRepository],
  exports: [SaasPaymentMethodConfigurationRepository],
})
export class SaasPaymentMethodConfigurationDataModule {}
