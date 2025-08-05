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
import { SaasSubscriptionService } from '../../services/subscription/saas-subscription.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionResponseDto,
} from '../../services/dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller('api/v1/subscriptions')
export class SaasSubscriptionController {
  constructor(private readonly subscriptionService: SaasSubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @HttpCode(HttpStatus.CREATED)
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionService.createSubscription(createSubscriptionDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Subscription created successfully',
      data: subscription,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
    type: [SubscriptionResponseDto],
  })
  async findAllSubscriptions() {
    const subscriptions = await this.subscriptionService.findAllSubscriptions();
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
    };
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get subscriptions by customer ID' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer subscriptions retrieved successfully',
    type: [SubscriptionResponseDto],
  })
  async findSubscriptionsByCustomer(@Param('customerId') customerId: string) {
    const subscriptions = await this.subscriptionService.findSubscriptionsByCustomer(customerId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Customer subscriptions retrieved successfully',
      data: subscriptions,
    };
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get subscriptions by application ID' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application subscriptions retrieved successfully',
    type: [SubscriptionResponseDto],
  })
  async findSubscriptionsByApplication(@Param('applicationId') applicationId: string) {
    const subscriptions = await this.subscriptionService.findSubscriptionsByApplication(
      applicationId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Application subscriptions retrieved successfully',
      data: subscriptions,
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get subscription analytics' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Application ID for filtering' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getSubscriptionAnalytics(@Query('applicationId') applicationId?: string) {
    const analytics = await this.subscriptionService.getSubscriptionAnalytics(applicationId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findSubscriptionById(@Param('id') id: string) {
    const subscription = await this.subscriptionService.findSubscriptionById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription retrieved successfully',
      data: subscription,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async updateSubscription(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.subscriptionService.updateSubscription(
      id,
      updateSubscriptionDto,
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
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancelSubscription(@Param('id') id: string) {
    const subscription = await this.subscriptionService.cancelSubscription(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription cancelled successfully',
      data: subscription,
    };
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription renewed successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async renewSubscription(@Param('id') id: string) {
    const subscription = await this.subscriptionService.renewSubscription(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription renewed successfully',
      data: subscription,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async deleteSubscription(@Param('id') id: string) {
    await this.subscriptionService.deleteSubscription(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription deleted successfully',
    };
  }
}
