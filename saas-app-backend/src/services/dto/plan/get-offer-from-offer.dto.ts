import { AutoMap } from '@automapper/classes';
import mongoose from 'mongoose';

export class GetPlanFromOfferDTO {
  @AutoMap()
  id: mongoose.Types.ObjectId;

  @AutoMap()
  planName: string;
}
