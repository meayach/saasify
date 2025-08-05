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
import { OrganizationModule } from './controllers/organization/organization.module';
import { SecurityModule } from './controllers/security/security.module';
import { BillingModule } from './controllers/billing/billing.module';

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

// Import services
import { UserService } from './services/user/user.service';
import { SaasApplicationService } from './services/application/saas-application.service';
import { SaasPlanService } from './services/plan/saas-plan.service';
import { SaasSubscriptionService } from './services/subscription/saas-subscription.service';
import { SaasPaymentService } from './services/payment/saas-payment.service';

// Import controllers
import { UserController } from './controllers/user/user.controller';
import { SaasApplicationController } from './controllers/application/saas-application.controller';
import { SaasPlanController } from './controllers/plan/saas-plan.controller';
import { SaasSubscriptionController } from './controllers/subscription/saas-subscription.controller';
import { DashboardSubscriptionController } from './controllers/subscription/dashboard-subscription.controller';
import { SaasPaymentController } from './controllers/payment/saas-payment.controller';
import { AuthControllerModule } from './controllers/auth/auth.controller.module';
import {
  SaasCustomerAdmin,
  SaasCustomerAdminSchema,
} from './data/models/saasCustomerAdmin/saas-customer-admin.model';

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
      { name: SaasApplication.name, schema: SaasApplicationSchema },
      { name: SaasApplicationConfiguration.name, schema: SaasApplicationConfigurationSchema },
      { name: SaasCurrency.name, schema: SaasCurrencySchema },
      { name: SaasPlan.name, schema: SaasPlanSchema },
      { name: SaasSubscription.name, schema: SaasSubscriptionSchema },
      { name: SaasPayment.name, schema: SaasPaymentSchema },
      { name: SaasPaymentMethodConfiguration.name, schema: SaasPaymentMethodConfigurationSchema },
      { name: SaasCustomerAdmin.name, schema: SaasCustomerAdminSchema },
      { name: SecuritySettings.name, schema: SecuritySettingsSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: BillingSettings.name, schema: BillingSettingsSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: Invoice.name, schema: InvoiceSchema },
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
    OrganizationModule,
    SecurityModule,
    BillingModule,
  ],
  controllers: [
    AppController,
    UserController,
    SaasApplicationController,
    SaasPlanController,
    SaasSubscriptionController,
    DashboardSubscriptionController,
    SaasPaymentController,
  ],
  providers: [
    AppService,
    UserService,
    SaasApplicationService,
    SaasPlanService,
    SaasSubscriptionService,
    SaasPaymentService,
  ],
})
export class AppModule {}
