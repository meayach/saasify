import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasSubscriptionDocument,
  SaasSubscriptionPOJO,
} from '@Data/models/saassubscription/saasSubscription.pojo.model';

@Injectable()
export class SaasSubscriptionRepository {
  constructor(
    @InjectModel(SaasSubscriptionPOJO.name)
    private saasSubscriptionModel: Model<SaasSubscriptionDocument>,
  ) {}
}
