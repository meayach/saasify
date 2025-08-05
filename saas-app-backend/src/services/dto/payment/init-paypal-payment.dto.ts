import { AutoMap } from '@automapper/classes';

export class InitPaypalPaymentDTO {
  @AutoMap()
  accessToken: string;

  @AutoMap()
  paymentMethod: string;

  @AutoMap()
  intent: string;

  @AutoMap()
  price: number;

  @AutoMap()
  currency: string;
}
