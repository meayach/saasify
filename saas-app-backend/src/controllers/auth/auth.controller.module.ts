import { ApplicationContextModule } from '@app/application-context/application-context.module';
import { GuardsModule } from '@Controllers/guards/guards.module';
import { MapperControllersModule } from '@Controllers/mappers/mapper-controllers.module';
import { Module } from '@nestjs/common';
import { ApplicationModule } from '@Services/application/application-service.module';
import { SecurityServiceModule } from '@Services/security/security-service.module';
import { AuthCustomerController } from './customer/api/auth.customer.controller';
import { AuthAdminController } from './admin/api/auth.admin.controller';
import { AuthManagerController } from './manager/api/auth.manager.controller';

@Module({
  imports: [
    ApplicationContextModule,
    SecurityServiceModule,
    ApplicationModule,
    GuardsModule,
    MapperControllersModule,
  ],
  controllers: [AuthCustomerController, AuthAdminController, AuthManagerController],
  providers: [],
})
export class AuthControllerModule {}
