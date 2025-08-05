import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasPaymentchema, SaasPaymentPOJO } from '@Data/models/SaasPayment/SaasPayment.pojo.model';
import { SaasPaymentRepository } from './repository/saasPayment.repository';
import { SaasPricingDataModule } from '@Data/saasPricing/saasPricing.data.module';
import { MapperServiceModule } from '@Services/mappers/mapper-service.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasPaymentPOJO.name,
        schema: SaasPaymentchema,
        collection: 'SaasPayments',
      },
    ]),
    SaasPricingDataModule,
    MapperServiceModule,
  ],
  providers: [SaasPaymentRepository], // put repo here
  exports: [SaasPaymentRepository], // put repo here
})
export class SaasPaymentDataModule {}
