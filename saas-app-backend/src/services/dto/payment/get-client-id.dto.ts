import { AutoMap } from '@automapper/classes';

export class PaymentsConfigResultsDTO {
  @AutoMap()
  clientKey: string;

  @AutoMap()
  provider: string;
}
