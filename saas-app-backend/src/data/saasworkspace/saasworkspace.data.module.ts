import {
  SaasWorkspacePOJO,
  SaasWorkspaceSchema,
} from '@Data/models/saasworkspace/saasWorkspace.pojo.model';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasWorkspacePaymentsRepository } from './repository/saas-workspace-payments.repository';
import { SaasWorkspacePlanRepository } from './repository/saas-workspace-plan.repository';
import { SaasworkspaceRepository } from './repository/saas-workspace.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasWorkspacePOJO.name,
        schema: SaasWorkspaceSchema,
        collection: 'SaasWorkspaces',
      },
    ]),
  ],
  providers: [
    SaasworkspaceRepository,
    SaasWorkspacePaymentsRepository,
    SaasWorkspacePlanRepository,
  ],
  exports: [SaasworkspaceRepository, SaasWorkspacePaymentsRepository, SaasWorkspacePlanRepository],
})
export class SaasworkspaceModule {}
