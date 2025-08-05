import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasSubscriptionHistoryPOJO,
  SaasSubscriptionHistorySchema,
} from '@Data/models/SaaSubscriptionHistory/SaasSubscriptionHistory.pojo.model';
import { SaasSubscriptionHistoryRepository } from './repository/saasSubscriptionHistory.repository';
import { SaasPaymentDataModule } from '@Data/SaasPayment/saasPayment.data.module';
import { MapperServiceModule } from '@Services/mappers/mapper-service.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasSubscriptionHistoryPOJO.name,
        schema: SaasSubscriptionHistorySchema,
        collection: 'SaasSubscriptionHistory',
      },
    ]),
    SaasPaymentDataModule,
    MapperServiceModule,
  ],

  providers: [SaasSubscriptionHistoryRepository], // put repo here
  exports: [SaasSubscriptionHistoryRepository], // put repo here
})
export class SaasSubscriptionHistoryDataModule {}
