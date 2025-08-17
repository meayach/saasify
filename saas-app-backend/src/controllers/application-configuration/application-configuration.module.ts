import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationConfigurationController } from './application-configuration.controller';
import { ApplicationConfigurationService } from '../../services/application-configuration/application-configuration.service';
import { ApplicationConfigurationSchema } from '../../data/models/applicationConfiguration/application-configuration.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'ApplicationConfiguration',
        schema: ApplicationConfigurationSchema,
      },
    ]),
  ],
  controllers: [ApplicationConfigurationController],
  providers: [ApplicationConfigurationService],
  exports: [ApplicationConfigurationService],
})
export class ApplicationConfigurationModule {}
