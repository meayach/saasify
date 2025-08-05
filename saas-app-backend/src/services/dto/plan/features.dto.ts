import { AutoMap } from '@automapper/classes';

export class FeaturesSignUpDTO {
  @AutoMap()
  authorizationJwt: string;
  @AutoMap()
  planToCheck: string;
}
