import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import Stripe from 'stripe';
import { SubscriptionManagementService } from '../../services/subscription/subscription-management.service';

@ApiTags('Webhooks')
@Controller('api/v1/webhooks')
export class WebhookController {
  private stripe: Stripe;

  constructor(private readonly subscriptionManagementService: SubscriptionManagementService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      // Utiliser la version par défaut de Stripe
    });
  }

  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      const body = request.rawBody || Buffer.from(JSON.stringify(request.body));
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    try {
      // Handle the event
      await this.subscriptionManagementService.handleStripeWebhook(event);

      return { received: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }
}
