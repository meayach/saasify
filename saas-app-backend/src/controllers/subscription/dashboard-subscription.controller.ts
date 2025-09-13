import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SaasSubscriptionService } from '../../services/subscription/saas-subscription.service';

export interface SubscriptionStatsDto {
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingSubscriptions: number;
  newClients: number;
  totalSubscriptions: number;
  cancelledSubscriptions: number;
}

@ApiTags('Dashboard Subscriptions')
@Controller('api/v1/dashboard-subscriptions')
export class DashboardSubscriptionController {
  constructor(private readonly subscriptionService: SaasSubscriptionService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription statistics for dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Subscription statistics retrieved successfully',
  })
  async getSubscriptionStats(): Promise<any> {
    try {
      // Récupérer toutes les statistiques d'abonnements
      const stats = await this.subscriptionService.getSubscriptionStats();
      console.log('DEBUG /dashboard-subscriptions/stats ->', stats);

      return {
        statusCode: HttpStatus.OK,
        message: 'Subscription statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      console.error('Error retrieving subscription stats:', error);

      // Retourner des données par défaut en cas d'erreur
      const defaultStats: SubscriptionStatsDto = {
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        pendingSubscriptions: 0,
        newClients: 0,
        totalSubscriptions: 0,
        cancelledSubscriptions: 0,
      };

      return {
        statusCode: HttpStatus.OK,
        message: 'Default subscription statistics returned',
        data: defaultStats,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get subscriptions for dashboard' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by subscription status' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  async getDashboardSubscriptions(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<any> {
    try {
      const subscriptions = await this.subscriptionService.getDashboardSubscriptions({
        status,
        limit: limit || 50,
        offset: offset || 0,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Subscriptions retrieved successfully',
        data: subscriptions,
      };
    } catch (error) {
      console.error('Error retrieving dashboard subscriptions:', error);

      return {
        statusCode: HttpStatus.OK,
        message: 'No subscriptions found',
        data: [],
      };
    }
  }
}
