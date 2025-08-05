import { ApplicationModule } from './application/application-service.module';
import { PaymentServiceModule } from './payment/payment-service.module';
import { SecurityServiceModule } from './security/security-service.module';
import { UserServiceModule } from './user/user-service.module';

let servicesModules = [
  ApplicationModule,
  SecurityServiceModule,
  UserServiceModule,
  PaymentServiceModule,
];
export { servicesModules };
