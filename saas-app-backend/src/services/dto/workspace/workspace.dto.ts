import { AutoMap } from '@automapper/classes';
import { UserDTO } from '../user/user.dto';

export class SaasWorkspaceDTO {
  @AutoMap()
  realmId: string;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  owner: UserDTO;

  @AutoMap()
  users?: UserDTO[];

  @AutoMap()
  workspaceName: string;
}
