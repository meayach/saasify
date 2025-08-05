import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, from } from 'rxjs';
import {
  BillingSettings,
  BillingSettingsDocument,
} from '../../data/models/billingSettings/billing-settings.schema';
import { Plan, PlanDocument } from '../../data/models/plan/plan.schema';
import {
  PaymentMethod,
  PaymentMethodDocument,
} from '../../data/models/paymentMethod/payment-method.schema';
import { Invoice, InvoiceDocument } from '../../data/models/invoice/invoice.schema';
import { UpdateBillingSettingsDto, CreatePlanDto, UpdatePlanDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(BillingSettings.name)
    private billingSettingsModel: Model<BillingSettingsDocument>,
    @InjectModel(Plan.name)
    private planModel: Model<PlanDocument>,
    @InjectModel(PaymentMethod.name)
    private paymentMethodModel: Model<PaymentMethodDocument>,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async getBillingSettings(): Promise<BillingSettings> {
    let settings = await this.billingSettingsModel.findOne().exec();

    if (!settings) {
      const defaultSettings = new this.billingSettingsModel({
        defaultCurrency: 'EUR',
        taxRate: 20,
        companyAddress: '',
        paymentMethods: ['stripe', 'paypal'],
        autoRenewal: true,
        invoiceDueDays: 30,
        companyName: '',
        companyEmail: '',
        companyPhone: '',
      });

      settings = await defaultSettings.save();
    }

    return settings;
  }

  async updateBillingSettings(updateDto: UpdateBillingSettingsDto): Promise<BillingSettings> {
    let settings = await this.billingSettingsModel.findOne().exec();

    if (!settings) {
      settings = new this.billingSettingsModel(updateDto);
    } else {
      Object.assign(settings, updateDto);
    }

    return settings.save();
  }

  async getPlans(): Promise<Plan[]> {
    return this.planModel.find().exec();
  }

  async createPlan(createDto: CreatePlanDto): Promise<Plan> {
    const plan = new this.planModel(createDto);
    return plan.save();
  }

  async updatePlan(id: string, updateDto: UpdatePlanDto): Promise<Plan> {
    return this.planModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async deletePlan(id: string): Promise<void> {
    await this.planModel.findByIdAndDelete(id).exec();
  }

  async activatePlan(id: string): Promise<Plan> {
    return this.planModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).exec();
  }

  async deactivatePlan(id: string): Promise<Plan> {
    return this.planModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return from(this.paymentMethodModel.find().exec());
  }

  async addPaymentMethod(methodData: any): Promise<PaymentMethod> {
    const paymentMethod = new this.paymentMethodModel(methodData);
    return paymentMethod.save();
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await this.paymentMethodModel.findByIdAndDelete(id).exec();
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    await this.paymentMethodModel.updateMany({}, { isDefault: false }).exec();
    return this.paymentMethodModel.findByIdAndUpdate(id, { isDefault: true }, { new: true }).exec();
  }

  getInvoices(page = 1, limit = 10): Observable<any> {
    const skip = (page - 1) * limit;

    const invoicesPromise = this.invoiceModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPromise = this.invoiceModel.countDocuments().exec();

    return from(
      Promise.all([invoicesPromise, totalPromise]).then(([invoices, total]) => ({
        invoices,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })),
    );
  }

  async generateInvoice(customerId: string, planId: string): Promise<Invoice> {
    const plan = await this.planModel.findById(planId).exec();
    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = new this.invoiceModel({
      customerId,
      planId,
      amount: plan.price,
      currency: 'EUR',
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      invoiceNumber,
    });

    return invoice.save();
  }

  async markInvoiceAsPaid(id: string): Promise<Invoice> {
    return this.invoiceModel
      .findByIdAndUpdate(id, { status: 'paid', paidDate: new Date() }, { new: true })
      .exec();
  }

  async downloadInvoice(id: string): Promise<string> {
    return `http://localhost:3001/api/v1/billing/invoices/${id}/download`;
  }

  async getBillingStats(): Promise<any> {
    const totalRevenue = await this.invoiceModel
      .aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .exec();

    const totalInvoices = await this.invoiceModel.countDocuments().exec();
    const paidInvoices = await this.invoiceModel.countDocuments({ status: 'paid' }).exec();
    const pendingInvoices = await this.invoiceModel.countDocuments({ status: 'pending' }).exec();

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
    };
  }
}
