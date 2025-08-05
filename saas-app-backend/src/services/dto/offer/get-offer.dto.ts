import { AutoMap } from '@automapper/classes';
import mongoose from 'mongoose';

export class GetOfferDTO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  offerName: string;
}
