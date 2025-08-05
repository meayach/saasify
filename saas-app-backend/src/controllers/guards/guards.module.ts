import { ApplicationContextModule } from '@app/application-context/application-context.module';
import { Module } from '@nestjs/common';
import { ApplicationModule } from '@Services/application/application-service.module';

@Module({
  imports: [ApplicationModule, ApplicationContextModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class GuardsModule {}
