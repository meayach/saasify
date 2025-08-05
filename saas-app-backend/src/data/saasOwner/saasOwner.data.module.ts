import {
  SaasCustomerAdminPOJO,
  SaasCustomerAdminSchema,
} from '@Data/models/saasCustomerAdmin/saasCustomerAdmin.pojo.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasOwnerRepository } from './repository/SaasOwner.repository';
import { SaasOwnerPOJO, SaasOwnerSchema } from '@Data/models/SaasOwner/saasOwner.pojo.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasOwnerPOJO.name,
        schema: SaasOwnerSchema,
        collection: 'SaasOwner',
      },
    ]),
  ],
  providers: [SaasOwnerRepository],
  exports: [SaasOwnerRepository],
})
export class SaasOwnerModule {}
