import { AutoMap } from '@automapper/classes';

export class CompleteOrderDTO {
  @AutoMap()
  orderId: string;

  @AutoMap()
  accessToken: string;

  @AutoMap()
  paymentMethod: string;
}
