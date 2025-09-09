import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscriptionConsumptionPOJO,
  SubscriptionConsumptionSchema,
} from '../models/subscriptionConsumption/subscriptionConsumption.pojo.model';
import { SubscriptionConsumptionRepository } from './repository/subscriptionConsumption.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SubscriptionConsumptionPOJO.name,
        schema: SubscriptionConsumptionSchema,
      },
    ]),
  ],
  providers: [SubscriptionConsumptionRepository],
  exports: [SubscriptionConsumptionRepository],
})
export class SubscriptionConsumptionDataModule {}
