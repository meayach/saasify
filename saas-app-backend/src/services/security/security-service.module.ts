import { SaasApplicationDataModule } from '@Data/saasApplication/saasApplication.data.module';

import { Module } from '@nestjs/common';
import { MapperServiceModule } from '@Services/mappers/mapper-service.module';
import { UserServiceModule } from '@Services/user/user-service.module';
import { SaasSubscriberDataModule } from '@Data/saasSubscriber/saasSubsriber.data.module';
import { AuthCustomerService } from './auth/customer/auth-customer.service';
import { SaasCustomerAdminModule } from '@Data/saasCustomerAdmin/saasCustomerAdmin.data.module';

@Module({
  imports: [
    UserServiceModule,
    SaasApplicationDataModule,
    SaasSubscriberDataModule,
    MapperServiceModule,
    SaasCustomerAdminModule,
  ],
  providers: [AuthCustomerService],
  exports: [AuthCustomerService],
})
export class SecurityServiceModule {}
