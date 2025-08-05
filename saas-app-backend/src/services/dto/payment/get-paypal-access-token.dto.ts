import { AutoMap } from '@automapper/classes';

export class GetPaypalAccessTokenDTO {
  @AutoMap()
  clientKey: string;
  @AutoMap()
  secretKey: string;
}
