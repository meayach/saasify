import { AutoMap } from '@automapper/classes';

export class ManagerCompletOrCancelPaymentDTO {
  @AutoMap()
  paymentMethod: string;

  @AutoMap()
  orderId: string;
}
