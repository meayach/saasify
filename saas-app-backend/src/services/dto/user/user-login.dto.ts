import { AutoMap } from '@automapper/classes';

export class UserLoginDTO {
  @AutoMap()
  username: string;
  @AutoMap()
  password: string;
}
