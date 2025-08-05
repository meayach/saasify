import { AutoMap } from '@automapper/classes';

export class GetAppDTO {
  @AutoMap()
  paymentMethod: string;

  @AutoMap()
  saasClientId: string;

  @AutoMap()
  saasRealmId: string;

  @AutoMap()
  saasPlan: string;

  @AutoMap()
  saasOffer: string;

  @AutoMap()
  currency: string;
}
