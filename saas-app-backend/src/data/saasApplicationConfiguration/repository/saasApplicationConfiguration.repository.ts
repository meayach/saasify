import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasApplicationConfigurationDocument,
  SaasApplicationConfigurationPOJO,
} from '@Data/models/saasApplicationConfiguration/saasApplicationConfiguration.pojo.model';

@Injectable()
export class SaasApplicationConfigurationRepository {
  constructor(
    @InjectModel(SaasApplicationConfigurationPOJO.name)
    private saasApplicationConfigurationModel: Model<SaasApplicationConfigurationDocument>,
  ) {}

  async getWorkspaceByName(name: string): Promise<SaasApplicationConfigurationPOJO> {
    return await this.saasApplicationConfigurationModel.findOne({ realmId: name });
  }
}
