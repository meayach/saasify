import {
  SaasApplicationPOJO,
  SaasApplicationSchema,
} from '@Data/models/saasApplication/saasApplication.pojo.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasApplicationRepository } from './repository/saasApplication.repository';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasApplicationPOJO.name,
        schema: SaasApplicationSchema,
        collection: 'SaasApplications',
      },
    ]),
  ],
  providers: [SaasApplicationRepository],
  exports: [SaasApplicationRepository],
})
export class SaasApplicationDataModule {}
