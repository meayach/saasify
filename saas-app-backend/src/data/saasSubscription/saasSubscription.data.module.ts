import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasSubscriptionPOJO,
  SaasSubscriptionSchema,
} from '@Data/models/saassubscription/saasSubscription.pojo.model';
import { SaasSubscriptionRepository } from './repository/saasSubscription.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasSubscriptionPOJO.name,
        schema: SaasSubscriptionSchema,
        collection: 'SaasSubscriptions',
      },
    ]),
  ],
  providers: [SaasSubscriptionRepository],
  exports: [SaasSubscriptionRepository],
})
export class SaasSubscriptionDataModule {}
