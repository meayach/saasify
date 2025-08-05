import { AutoMap } from '@automapper/classes';

export class ManagerInitiatePaymentDTO {
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

  @AutoMap()
  subscription: string;
}
