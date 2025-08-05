import { AutoMap } from '@automapper/classes';
import { SaasWorkspacePOJO } from '@Data/models/saasworkspace/saasWorkspace.pojo.model';

import { Prop } from '@nestjs/mongoose';

export class SaasApplicationDTO {
  @AutoMap()
  @Prop()
  realmClientId: string;

  @Prop()
  @AutoMap()
  realmClientSecret: string;

  @Prop()
  @AutoMap()
  saasClientSecret: string;

  @Prop()
  @AutoMap()
  applicationName: string;

  @AutoMap()
  workspace?: SaasWorkspacePOJO;

  @Prop()
  @AutoMap()
  createdAt: Date;
}
