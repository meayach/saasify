import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasWorkspaceConfigurationDocument,
  SaasWorkspaceConfigurationPOJO,
} from '@Data/models/saasWorkspaceConfiguration/saasWorkspaceConfiguration.pojo.model';

@Injectable()
export class SaasWorkspaceConfigurationRepository {
  constructor(
    @InjectModel(SaasWorkspaceConfigurationPOJO.name)
    private saasWorkspaceConfigurationModel: Model<SaasWorkspaceConfigurationDocument>,
  ) {}
}
