import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasWorkspaceConfigurationPOJO,
  SaasWorkspaceConfigurationSchema,
} from '@Data/models/saasWorkspaceConfiguration/saasWorkspaceConfiguration.pojo.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasWorkspaceConfigurationPOJO.name,
        schema: SaasWorkspaceConfigurationSchema,
        collection: 'SaasWorkspaceConfiguartaions',
      },
    ]),
  ],
  providers: [SaasWorkspaceConfigurationPOJO],
  exports: [SaasWorkspaceConfigurationPOJO],
})
export class WorkspaceConfigurationDataModule {}
