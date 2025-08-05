import { AutoMap } from '@automapper/classes';

export class UserLoginRealmDTO {
  @AutoMap()
  username: string;
  @AutoMap()
  password: string;
  @AutoMap()
  realmId: string;
}
