import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasCurrencyDocument,
  SaasCurrencyPOJO,
} from '@Data/models/saasCurrency/saasCurrency.pojo.model';

@Injectable()
export class SaasCurrencyRepository {
  constructor(
    @InjectModel(SaasCurrencyPOJO.name)
    private saasCurrencyModel: Model<SaasCurrencyDocument>,
  ) {}
}
