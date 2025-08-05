import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaasPayment } from '../../data/models/SaasPayment/saas-payment.model';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';

@Injectable()
export class SaasPaymentService {
  constructor(
    @InjectModel('SaasPayment')
    private readonly paymentModel: Model<SaasPayment>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<SaasPayment> {
    const payment = new this.paymentModel({
      ...createPaymentDto,
      paymentDate: new Date(),
      status: 'PENDING',
    });
    return payment.save();
  }

  async findAllPayments(): Promise<SaasPayment[]> {
    return this.paymentModel.find().populate('subscriptionId').populate('customerId').exec();
  }

  async findPaymentById(id: string): Promise<SaasPayment> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('subscriptionId')
      .populate('customerId')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findPaymentsByCustomer(customerId: string): Promise<SaasPayment[]> {
    return this.paymentModel.find({ customerId }).populate('subscriptionId').exec();
  }

  async findPaymentsBySubscription(subscriptionId: string): Promise<SaasPayment[]> {
    return this.paymentModel.find({ subscriptionId }).populate('customerId').exec();
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto): Promise<SaasPayment> {
    const payment = await this.paymentModel
      .findByIdAndUpdate(id, updatePaymentDto, { new: true })
      .populate('subscriptionId')
      .populate('customerId')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async processPayment(id: string, transactionId: string): Promise<SaasPayment> {
    const payment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          status: 'COMPLETED',
          transactionId,
          processedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async refundPayment(id: string, reason?: string): Promise<SaasPayment> {
    const payment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          status: 'REFUNDED',
          refundReason: reason,
          refundedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
  }

  async getPaymentAnalytics(customerId?: string) {
    const matchStage = customerId ? { customerId } : {};

    const analytics = await this.paymentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalRevenue = await this.paymentModel.aggregate([
      { $match: { ...matchStage, status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      analytics,
      totalPayments: await this.paymentModel.countDocuments(matchStage),
      totalRevenue: totalRevenue[0]?.total || 0,
      successfulPayments: await this.paymentModel.countDocuments({
        ...matchStage,
        status: 'COMPLETED',
      }),
    };
  }

  async getMonthlyRevenue(year: number, customerId?: string) {
    const matchStage: any = {
      status: 'COMPLETED',
      paymentDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    };

    if (customerId) {
      matchStage.customerId = customerId;
    }

    return this.paymentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}
