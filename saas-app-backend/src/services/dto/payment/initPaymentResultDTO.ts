import { AutoMap } from '@automapper/classes';

export class InitiatePaymentResultDTO {
  @AutoMap()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
