import {
  SaasCustomerAdmin,
  SaasCustomerAdminSchema,
} from '@Data/models/saasCustomerAdmin/saas-customer-admin.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasCustomerAdminRepository } from './repository/SaasCustomerAdmin.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasCustomerAdmin.name,
        schema: SaasCustomerAdminSchema,
        collection: 'saasCustomerAdmins',
      },
    ]),
  ],
  providers: [SaasCustomerAdminRepository],
  exports: [SaasCustomerAdminRepository],
})
export class SaasCustomerAdminModule {}
