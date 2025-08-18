import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '../../services/payment/payment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export class CreatePaymentMethodDto {
  type: string;
  cardToken?: string;
  paypalAccountId?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

@ApiTags('Payment Management')
@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get user payment methods' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
  })
  async getPaymentMethods(@Req() req: any) {
    const userId = req.user.id;
    const paymentMethods = await this.paymentService.getUserPaymentMethods(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment methods retrieved successfully',
      data: paymentMethods,
    };
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Add a new payment method' })
  @ApiResponse({
    status: 201,
    description: 'Payment method added successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async addPaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto, @Req() req: any) {
    const userId = req.user.id;
    const paymentMethod = await this.paymentService.addPaymentMethod(
      userId,
      createPaymentMethodDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment method added successfully',
      data: paymentMethod,
    };
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment method deleted successfully',
  })
  async deletePaymentMethod(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    await this.paymentService.deletePaymentMethod(userId, id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment method deleted successfully',
    };
  }

  @Post('set-default-payment-method')
  @ApiOperation({ summary: 'Set default payment method' })
  @ApiResponse({
    status: 200,
    description: 'Default payment method updated successfully',
  })
  async setDefaultPaymentMethod(@Body() data: { paymentMethodId: string }, @Req() req: any) {
    const userId = req.user.id;
    await this.paymentService.setDefaultPaymentMethod(userId, data.paymentMethodId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Default payment method updated successfully',
    };
  }

  @Get('billing-history')
  @ApiOperation({ summary: 'Get user billing history' })
  @ApiResponse({
    status: 200,
    description: 'Billing history retrieved successfully',
  })
  async getBillingHistory(@Req() req: any) {
    const userId = req.user.id;
    const billingHistory = await this.paymentService.getUserBillingHistory(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Billing history retrieved successfully',
      data: billingHistory,
    };
  }

  @Post('create-subscription-intent')
  @ApiOperation({ summary: 'Create payment intent for subscription' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async createSubscriptionPaymentIntent(
    @Body()
    data: {
      planId: string;
      billingCycle: string;
      paymentMethodId?: string;
      couponCode?: string;
    },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const paymentIntent = await this.paymentService.createSubscriptionPaymentIntent(userId, data);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment intent created successfully',
      data: paymentIntent,
    };
  }
}
