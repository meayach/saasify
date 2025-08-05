import {
  SaasWorkspaceDocument,
  SaasWorkspacePOJO,
} from '@Data/models/saasworkspace/saasWorkspace.pojo.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export class SaasWorkspacePlanRepository {
  constructor(
    @InjectModel(SaasWorkspacePOJO.name)
    private saasWorkspaceModel: Model<SaasWorkspaceDocument>,
  ) {}
}
