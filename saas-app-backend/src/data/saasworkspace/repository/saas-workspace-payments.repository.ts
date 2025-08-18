import {
  SaasWorkspaceDocument,
  SaasWorkspacePOJO,
} from '@Data/models/saasworkspace/saasWorkspace.pojo.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class SaasWorkspacePaymentsRepository {
  constructor(
    @InjectModel(SaasWorkspacePOJO.name)
    private saasWorkspaceModel: Model<SaasWorkspaceDocument>,
  ) {}

  async getPaymentsConfigFromWorkspace(
    saasClientId: string,
    saasRealmId: string,
  ): Promise<SaasWorkspacePOJO> {
    const saasWorkspace: SaasWorkspacePOJO = await this.saasWorkspaceModel
      .findOne({ realmId: saasRealmId })
      .select('applications -_id')
      .populate({
        path: 'applications',
        match: { realmClientId: saasClientId },
        select: '-_id applicationConfiguration',
        populate: {
          path: 'applicationConfiguration',
          select: '-_id -application',
          populate: {
            path: 'paymentMethodConfigurations',
            select: '-_id clientKey provider',
          },
        },
      });
    return saasWorkspace;
  }
}
