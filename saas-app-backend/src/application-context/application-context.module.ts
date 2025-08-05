import { Module } from '@nestjs/common';
import { CustomerRequestContextService } from './application-context.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CustomerRequestContextService],
  exports: [CustomerRequestContextService],
})
export class ApplicationContextModule {}
