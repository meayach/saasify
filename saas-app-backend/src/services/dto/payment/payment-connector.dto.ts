import { AutoMap } from '@automapper/classes';

export class GetPaymentConnectorDTO {
  @AutoMap()
  paymentMethod: string;
}
