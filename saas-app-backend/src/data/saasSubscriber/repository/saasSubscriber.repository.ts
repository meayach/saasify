import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasSubscriberDocument,
  SaasSubscriberPOJO,
} from '@Data/models/saasSubscriber/saasSubscriber.pojo.model';

@Injectable()
export class SaasSubscriberRepository {
  constructor(
    @InjectModel(SaasSubscriberPOJO.name)
    private saassubscribermodel: Model<SaasSubscriberDocument>,
  ) {}
}
