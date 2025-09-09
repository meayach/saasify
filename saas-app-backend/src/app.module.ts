import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationModule } from './controllers/application/application.module';
import { ApplicationConfigurationModule } from './controllers/application-configuration/application-configuration.module';
import { OrganizationModule } from './controllers/organization/organization.module';
import { SecurityModule } from './controllers/security/security.module';
import { BillingModule } from './controllers/billing/billing.module';
import { FeatureManagementModule } from './modules/feature-management.module';
// import { FeatureModule } from './controllers/feature/feature.module'; // TEMPORARILY COMMENTED FOR COMPILATION

// Import models
import { User, UserSchema } from './data/models/user/user.model';
import {
  SaasApplication,
  SaasApplicationSchema,
} from './data/models/saasApplication/saas-application.model';
import {
  SaasApplicationConfiguration,
  SaasApplicationConfigurationSchema,
} from './data/models/saasApplicationConfiguration/saas-application-configuration.model';
import { SaasCurrency, SaasCurrencySchema } from './data/models/saasCurrency/saas-currency.model';
import { SaasPlan, SaasPlanSchema } from './data/models/saasPlan/saas-plan.model';
import {
  SaasSubscription,
  SaasSubscriptionSchema,
} from './data/models/saassubscription/saas-subscription.model';
import { SaasPayment, SaasPaymentSchema } from './data/models/SaasPayment/saas-payment.model';
import {
  SaasPaymentMethodConfiguration,
  SaasPaymentMethodConfigurationSchema,
} from './data/models/saasPaymentMethodConfiguration/saas-payment-method-configuration.model';
import {
  SecuritySettings,
  SecuritySettingsSchema,
} from './data/models/securitySettings/security-settings.schema';
import { AuditLog, AuditLogSchema } from './data/models/auditLog/audit-log.schema';
import {
  BillingSettings,
  BillingSettingsSchema,
} from './data/models/billingSettings/billing-settings.schema';
import { Plan, PlanSchema } from './data/models/plan/plan.schema';
import {
  PaymentMethod,
  PaymentMethodSchema,
} from './data/models/paymentMethod/payment-method.schema';
import { Invoice, InvoiceSchema } from './data/models/invoice/invoice.schema';
import {
  SaasCustomerAdmin,
  SaasCustomerAdminSchema,
} from './data/models/saasCustomerAdmin/saas-customer-admin.model';

// Import new feature models - TEMPORARILY COMMENTED FOR COMPILATION
// import { FeaturePOJO, FeatureSchema } from './data/models/feature/feature.pojo.model';
// import { FeatureCustomFieldPOJO, FeatureCustomFieldSchema } from './data/models/featureCustomField/featureCustomField.pojo.model';
// import { FeaturePlanConfigurationPOJO, FeaturePlanConfigurationSchema } from './data/models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';
// import { FeatureCustomFieldValuePOJO, FeatureCustomFieldValueSchema } from './data/models/featureCustomFieldValue/featureCustomFieldValue.pojo.model';
// import { SubscriptionConsumptionPOJO, SubscriptionConsumptionSchema } from './data/models/subscriptionConsumption/subscriptionConsumption.pojo.model';

import { SaasOfferDataModule } from './data/saasOffer/saasOffer.data.module';
import { SaasApplicationDataModule } from './data/saasApplication/saasApplication.data.module';

// Import services
import { UserService } from './services/user/user.service';
import { SaasApplicationService } from './services/application/saas-application.service';
import { SaasPlanService } from './services/plan/saas-plan.service';
import { SaasSubscriptionService } from './services/subscription/saas-subscription.service';
import { SaasPaymentService } from './services/payment/saas-payment.service';
import { SaasOfferService } from './services/offer/saas-offer.service';

// Import controllers
import { UserController } from './controllers/user/user.controller';
import { SaasApplicationController } from './controllers/application/saas-application.controller';
import { SaasPlanController } from './controllers/plan/saas-plan.controller';
import { SaasSubscriptionController } from './controllers/subscription/saas-subscription.controller';
import { DashboardSubscriptionController } from './controllers/subscription/dashboard-subscription.controller';
import { SaasPaymentController } from './controllers/payment/saas-payment.controller';
import { SaasOfferController } from './controllers/offer/saas-offer.controller';
import { AuthControllerModule } from './controllers/auth/auth.controller.module';
import { SaasCustomerAdminModule } from './data/saasCustomerAdmin/saasCustomerAdmin.data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL', 'mongodb://localhost:27017/saas-database'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SaasCustomerAdmin.name, schema: SaasCustomerAdminSchema },
      { name: SaasApplication.name, schema: SaasApplicationSchema },
      { name: SaasApplicationConfiguration.name, schema: SaasApplicationConfigurationSchema },
      { name: SaasCurrency.name, schema: SaasCurrencySchema },
      { name: SaasPlan.name, schema: SaasPlanSchema },
      { name: SaasSubscription.name, schema: SaasSubscriptionSchema },
      { name: SaasPayment.name, schema: SaasPaymentSchema },
      { name: SaasPaymentMethodConfiguration.name, schema: SaasPaymentMethodConfigurationSchema },
      { name: SecuritySettings.name, schema: SecuritySettingsSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: BillingSettings.name, schema: BillingSettingsSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      // New feature management schemas - TEMPORARILY COMMENTED FOR COMPILATION
      // { name: FeaturePOJO.name, schema: FeatureSchema },
      // { name: FeatureCustomFieldPOJO.name, schema: FeatureCustomFieldSchema },
      // { name: FeaturePlanConfigurationPOJO.name, schema: FeaturePlanConfigurationSchema },
      // { name: FeatureCustomFieldValuePOJO.name, schema: FeatureCustomFieldValueSchema },
      // { name: SubscriptionConsumptionPOJO.name, schema: SubscriptionConsumptionSchema },
    ]),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-default-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
    AutomapperModule.forRoot({ strategyInitializer: classes() }),
    AuthControllerModule,
    ApplicationModule,
    ApplicationConfigurationModule,
    OrganizationModule,
    SecurityModule,
    BillingModule,
    FeatureManagementModule,
    // FeatureModule, // TEMPORARILY COMMENTED FOR COMPILATION
    SaasCustomerAdminModule,
    SaasOfferDataModule,
    SaasApplicationDataModule,
  ],
  controllers: [
    AppController,
    UserController,
    SaasApplicationController,
    SaasPlanController,
    SaasSubscriptionController,
    DashboardSubscriptionController,
    SaasPaymentController,
    SaasOfferController,
  ],
  providers: [
    AppService,
    UserService,
    SaasApplicationService,
    SaasPlanService,
    SaasSubscriptionService,
    SaasPaymentService,
    SaasOfferService,
  ],
})
export class AppModule {}
