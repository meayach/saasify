import { AutoMap } from '@automapper/classes';
import { SaasWorkspaceDTO } from '../workspace/workspace.dto';
import { UserRoleDTO } from './user-role.dto';

export class UserDTO {
  @AutoMap()
  username: string;

  @AutoMap()
  email: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  realmUserId: string;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  activated: boolean;

  @AutoMap()
  userRole?: UserRoleDTO;

  @AutoMap(() => SaasWorkspaceDTO)
  saasWorkspace?: SaasWorkspaceDTO;
}
