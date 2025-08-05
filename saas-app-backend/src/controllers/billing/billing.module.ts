import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import {
  BillingSettings,
  BillingSettingsSchema,
} from '../../data/models/billingSettings/billing-settings.schema';
import { Plan, PlanSchema } from '../../data/models/plan/plan.schema';
import {
  PaymentMethod,
  PaymentMethodSchema,
} from '../../data/models/paymentMethod/payment-method.schema';
import { Invoice, InvoiceSchema } from '../../data/models/invoice/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BillingSettings.name, schema: BillingSettingsSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
