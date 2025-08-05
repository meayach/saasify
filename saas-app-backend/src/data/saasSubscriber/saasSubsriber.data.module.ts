import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasSubscriberPOJO,
  SaasSubscriberSchema,
} from '@Data/models/saasSubscriber/saasSubscriber.pojo.model';
import { SaasSubscriberRepository } from './repository/saasSubscriber.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasSubscriberPOJO.name,
        schema: SaasSubscriberSchema,
        collection: 'SaasSubscribers',
      },
    ]),
  ],
  providers: [SaasSubscriberRepository],
  exports: [SaasSubscriberRepository],
})
export class SaasSubscriberDataModule {}
