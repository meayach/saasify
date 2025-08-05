import { AutoMap } from '@automapper/classes';

export class UserTokenInfoDTO {
  @AutoMap()
  access_token: string;
  @AutoMap()
  refresh_token: string;
}
