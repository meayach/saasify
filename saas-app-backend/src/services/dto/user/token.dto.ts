import { AutoMap } from '@automapper/classes';

export class VerifyUserTokenDTO {
  @AutoMap()
  token: string;
  @AutoMap()
  client_id: string;
  @AutoMap()
  client_secret: string;
  @AutoMap()
  realmId: string;
}
