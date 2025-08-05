import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasPaymentDocument,
  SaasPaymentPOJO,
} from '@Data/models/SaasPayment/SaasPayment.pojo.model';

@Injectable()
export class SaasPaymentRepository {
  constructor(
    @InjectModel(SaasPaymentPOJO.name)
    private saasPaymentModel: Model<SaasPaymentDocument>,
  ) {}
}
