import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SaasPaymentService } from '../../services/payment/saas-payment.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  PaymentResponseDto,
} from '../../services/dto/payment.dto';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class SaasPaymentController {
  constructor(private readonly paymentService: SaasPaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @HttpCode(HttpStatus.CREATED)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentService.createPayment(createPaymentDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment created successfully',
      data: payment,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  async findAllPayments() {
    const payments = await this.paymentService.findAllPayments();
    return {
      statusCode: HttpStatus.OK,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get payments by customer ID' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  async findPaymentsByCustomer(@Param('customerId') customerId: string) {
    const payments = await this.paymentService.findPaymentsByCustomer(customerId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Customer payments retrieved successfully',
      data: payments,
    };
  }

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get payments by subscription ID' })
  @ApiParam({ name: 'subscriptionId', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  async findPaymentsBySubscription(@Param('subscriptionId') subscriptionId: string) {
    const payments = await this.paymentService.findPaymentsBySubscription(subscriptionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription payments retrieved successfully',
      data: payments,
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get payment analytics' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Customer ID for filtering' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getPaymentAnalytics(@Query('customerId') customerId?: string) {
    const analytics = await this.paymentService.getPaymentAnalytics(customerId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('revenue/:year')
  @ApiOperation({ summary: 'Get monthly revenue for a year' })
  @ApiParam({ name: 'year', description: 'Year for revenue calculation' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Customer ID for filtering' })
  @ApiResponse({ status: 200, description: 'Revenue data retrieved successfully' })
  async getMonthlyRevenue(@Param('year') year: number, @Query('customerId') customerId?: string) {
    const revenue = await this.paymentService.getMonthlyRevenue(year, customerId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Revenue data retrieved successfully',
      data: revenue,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findPaymentById(@Param('id') id: string) {
    const payment = await this.paymentService.findPaymentById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updatePayment(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentService.updatePayment(id, updatePaymentDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment updated successfully',
      data: payment,
    };
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async processPayment(@Param('id') id: string, @Body() processPaymentDto: ProcessPaymentDto) {
    const payment = await this.paymentService.processPayment(id, processPaymentDto.transactionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment processed successfully',
      data: payment,
    };
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(@Param('id') id: string, @Body() refundPaymentDto: RefundPaymentDto) {
    const payment = await this.paymentService.refundPayment(id, refundPaymentDto.reason);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment refunded successfully',
      data: payment,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async deletePayment(@Param('id') id: string) {
    await this.paymentService.deletePayment(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment deleted successfully',
    };
  }
}
