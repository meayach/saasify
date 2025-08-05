import { AutoMap } from '@automapper/classes';

export class CreateNewPaymentAndSubscriptionHistoryDTO {
  @AutoMap()
  currency: string;

  @AutoMap()
  paymentMethod: string;

  @AutoMap()
  price: number;

  @AutoMap()
  orderId: string;
}
