import { AutoMap } from '@automapper/classes';
import mongoose from 'mongoose';

export class GetPlanPriceDTO {
  @AutoMap()
  id: mongoose.Types.ObjectId;

  @AutoMap()
  currency: string;
}
