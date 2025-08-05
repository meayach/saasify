import { AutoMap } from '@automapper/classes';

export class CreateNewPaymentDTO {
  @AutoMap()
  currency: string;

  @AutoMap()
  paymentMethod: string;

  @AutoMap()
  price: number;
}
