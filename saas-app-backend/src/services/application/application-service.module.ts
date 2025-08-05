import { SaasApplicationDataModule } from '@Data/saasApplication/saasApplication.data.module';
import { Module } from '@nestjs/common';
import { MapperServiceModule } from '@Services/mappers/mapper-service.module';
import { ApplicationService } from './business/apllication-service';

@Module({
  imports: [SaasApplicationDataModule, MapperServiceModule],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
