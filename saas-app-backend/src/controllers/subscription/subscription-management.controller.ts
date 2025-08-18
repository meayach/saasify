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
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionManagementService } from '../../services/subscription/subscription-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { BillingCycle } from '../../data/models/saassubscription/saas-subscription.model';

export class CreateSubscriptionDto {
  planId: string;
  paymentMethodId?: string;
  billingCycle: BillingCycle;
  couponCode?: string;
}

export class UpdateSubscriptionDto {
  planId?: string;
  autoRenew?: boolean;
}

@ApiTags('Subscription Management')
@Controller('api/v1/subscription-management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionManagementController {
  constructor(private readonly subscriptionManagementService: SubscriptionManagementService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @HttpCode(HttpStatus.CREATED)
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req: any) {
    const userId = req.user.id;
    const subscription = await this.subscriptionManagementService.createSubscription({
      userId,
      ...createSubscriptionDto,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Subscription created successfully',
      data: subscription,
    };
  }

  @Get('my-subscriptions')
  @ApiOperation({ summary: 'Get current user subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  async getMySubscriptions(@Req() req: any) {
    const userId = req.user.id;
    const subscriptions = await this.subscriptionManagementService.getUserSubscriptions(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
    };
  }

  @Patch(':id/upgrade')
  @ApiOperation({ summary: 'Upgrade/Downgrade subscription plan' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  async updateSubscriptionPlan(@Param('id') id: string, @Body() updateDto: { planId: string }) {
    const subscription = await this.subscriptionManagementService.updateSubscription(
      id,
      updateDto.planId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription updated successfully',
      data: subscription,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiQuery({
    name: 'immediately',
    required: false,
    type: Boolean,
    description: 'Cancel immediately or at period end',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelSubscription(@Param('id') id: string, @Query('immediately') immediately = false) {
    const subscription = await this.subscriptionManagementService.cancelSubscription(
      id,
      immediately,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription cancelled successfully',
      data: subscription,
    };
  }

  @Post(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate cancelled subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription reactivated successfully',
  })
  async reactivateSubscription(@Param('id') id: string) {
    // Implementation for reactivating subscription
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription reactivated successfully',
    };
  }
}
