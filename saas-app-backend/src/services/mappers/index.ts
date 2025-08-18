import { CustomerAdminServiceMapper } from './customer-admin/customer-admin-service.mapper';
import { CustomerAdminServiceMapperConfig } from './customer-admin/customer-admin-service.mapper.config';
import { PaymentManagerMapper } from './payment-manager/payment-manager.mapper';
import { PaymentManagerMapperConfig } from './payment-manager/payment-manager.mapper.config';
import { UserServiceMapper } from './user/user-service.mapper';
import { UserServiceMapperConfig } from './user/user-service.mapper.config';

const mapperServices = [
  UserServiceMapper,
  PaymentManagerMapper,

  // new
  CustomerAdminServiceMapper,
];
const mapperServiceConfigs = [
  UserServiceMapperConfig,
  PaymentManagerMapperConfig,

  // new
  CustomerAdminServiceMapperConfig,
];

export { mapperServices, mapperServiceConfigs };
