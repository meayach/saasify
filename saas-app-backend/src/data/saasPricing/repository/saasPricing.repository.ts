import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasPricingDocument,
  SaasPricingPOJO,
} from '@Data/models/saasPricing/saasPricing.pojo.model';
import { GetPriceDTO } from '@Services/dto/price/get-price.dto';

@Injectable()
export class SaasPricingRepository {
  constructor(
    @InjectModel(SaasPricingPOJO.name)
    private saasPricingModel: Model<SaasPricingDocument>,
  ) {}
}
