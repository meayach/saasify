import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasSubscriptionHistoryDocument,
  SaasSubscriptionHistoryPOJO,
} from '@Data/models/SaaSubscriptionHistory/SaasSubscriptionHistory.pojo.model';

@Injectable()
export class SaasSubscriptionHistoryRepository {
  constructor(
    @InjectModel(SaasSubscriptionHistoryPOJO.name)
    private saasSubscriptionHistory: Model<SaasSubscriptionHistoryDocument>,
  ) {}
}
