import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { SaasApplicationDataModule } from '@Data/saasApplication/saasApplication.data.module';

@Module({
  imports: [SaasApplicationDataModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
