import { AutoMap } from '@automapper/classes';

export class GetPriceDTO {
  @AutoMap()
  currency: string;

  @AutoMap()
  price: number;
}
