import { SaasPaymentDataModule } from './SaasPayment/saasPayment.data.module';
import { SaasApplicationDataModule } from './saasApplication/saasApplication.data.module';
import { SaasCurrencyDataModule } from './saasCurrency/saasCurrency.data.module';
import { SaasOfferDataModule } from './saasOffer/saasOffer.data.module';
import { SaasPaymentMethodConfigurationDataModule } from './saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.data.module';
import { SaasPlanDataModule } from './saasPlan/saasPlan.data.module';
import { SaasPricingDataModule } from './saasPricing/saasPricing.data.module';
import { SaasSubscriberDataModule } from './saasSubscriber/saasSubsriber.data.module';
import { SaasSubscriptionDataModule } from './saasSubscription/saasSubscription.data.module';
import { SaasSubscriptionHistoryDataModule } from './saasSubscriptionHistory/saasSubscriptionHistory.data.module';
import { SaasworkspaceModule } from './saasworkspace/saasworkspace.data.module';
import { UserDataModule } from './user/user.data.module';
import { WorkspaceConfigurationDataModule } from './saasWorkspaceConfiguration/saasWorkspaceConfiguration.data.module';
import { SaasCustomerAdminModule } from './saasCustomerAdmin/saasCustomerAdmin.data.module';
import { SaasApplicationConfigurationDataModule } from './saasApplicationConfiguration/saasApplicationConfiguration.data.module';

const dataModules = [
  SaasworkspaceModule,
  UserDataModule,
  SaasApplicationDataModule,
  SaasApplicationConfigurationDataModule,
  WorkspaceConfigurationDataModule,
  SaasPaymentMethodConfigurationDataModule,
  SaasOfferDataModule,
  SaasPlanDataModule,
  SaasPricingDataModule,
  SaasCurrencyDataModule,

  // new
  SaasPaymentDataModule,
  SaasSubscriptionDataModule,
  SaasSubscriberDataModule,
  SaasPaymentDataModule,
  SaasSubscriptionHistoryDataModule,
  SaasCustomerAdminModule,
];
export { dataModules };
