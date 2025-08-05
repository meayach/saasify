import { Module } from '@nestjs/common';
import { PaymentManager } from './payment-manager/payment-manager.service';
import { HttpModule } from '@nestjs/axios';
import { SaasworkspaceModule } from '@Data/saasworkspace/saasworkspace.data.module';
import { SaasApplicationDataModule } from '@Data/saasApplication/saasApplication.data.module';
import { MapperServiceModule } from '@Services/mappers/mapper-service.module';

@Module({
  imports: [HttpModule, SaasworkspaceModule, SaasApplicationDataModule, MapperServiceModule],
  providers: [PaymentManager],
  exports: [PaymentManager],
})
export class PaymentServiceModule {}
