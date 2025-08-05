import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasApplicationConfigurationPOJO,
  SaasApplicationConfigurationSchema,
} from '@Data/models/saasApplicationConfiguration/saasApplicationConfiguration.pojo.model';
import { SaasApplicationConfigurationRepository } from './repository/saasApplicationConfiguration.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasApplicationConfigurationPOJO.name,
        schema: SaasApplicationConfigurationSchema,
        collection: 'SaasApplicationConfigurations',
      },
    ]),
  ],
  providers: [SaasApplicationConfigurationRepository],
  exports: [SaasApplicationConfigurationRepository],
})
export class SaasApplicationConfigurationDataModule {}
