import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import {
  CreateBillingSettingsDto,
  UpdateBillingSettingsDto,
  CreatePlanDto,
  UpdatePlanDto,
} from './dto/billing.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Billing')
@Controller('api/v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Paramètres de facturation
  @Get('settings')
  @ApiOperation({ summary: 'Get billing settings' })
  @ApiResponse({ status: 200, description: 'Billing settings retrieved successfully' })
  async getBillingSettings() {
    return this.billingService.getBillingSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update billing settings' })
  @ApiResponse({ status: 200, description: 'Billing settings updated successfully' })
  async updateBillingSettings(@Body() updateDto: UpdateBillingSettingsDto) {
    return this.billingService.updateBillingSettings(updateDto);
  }

  // Plans
  @Get('plans')
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async createPlan(@Body() createDto: CreatePlanDto) {
    return this.billingService.createPlan(createDto);
  }

  @Put('plans/:id')
  @ApiOperation({ summary: 'Update a plan' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  async updatePlan(@Param('id') id: string, @Body() updateDto: UpdatePlanDto) {
    return this.billingService.updatePlan(id, updateDto);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete a plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  async deletePlan(@Param('id') id: string) {
    return this.billingService.deletePlan(id);
  }

  // Méthodes de paiement
  @Get('payment-methods')
  @ApiOperation({ summary: 'Get payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods() {
    return this.billingService.getPaymentMethods();
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Add payment method' })
  @ApiResponse({ status: 201, description: 'Payment method added successfully' })
  async addPaymentMethod(@Body() methodData: any) {
    return this.billingService.addPaymentMethod(methodData);
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  async deletePaymentMethod(@Param('id') id: string) {
    return this.billingService.deletePaymentMethod(id);
  }

  @Put('payment-methods/:id/default')
  @ApiOperation({ summary: 'Set default payment method' })
  @ApiResponse({ status: 200, description: 'Default payment method set successfully' })
  async setDefaultPaymentMethod(@Param('id') id: string) {
    return this.billingService.setDefaultPaymentMethod(id);
  }

  // Factures
  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getInvoices(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.billingService.getInvoices(page, limit);
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Generate invoice' })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  async generateInvoice(@Body() invoiceData: { customerId: string; planId: string }) {
    return this.billingService.generateInvoice(invoiceData.customerId, invoiceData.planId);
  }

  @Put('invoices/:id/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid successfully' })
  async markInvoiceAsPaid(@Param('id') id: string) {
    return this.billingService.markInvoiceAsPaid(id);
  }

  @Get('invoices/:id/download')
  @ApiOperation({ summary: 'Download invoice' })
  @ApiResponse({ status: 200, description: 'Invoice downloaded successfully' })
  async downloadInvoice(@Param('id') id: string) {
    return this.billingService.downloadInvoice(id);
  }

  // Statistiques
  @Get('stats')
  @ApiOperation({ summary: 'Get billing statistics' })
  @ApiResponse({ status: 200, description: 'Billing statistics retrieved successfully' })
  async getBillingStats() {
    return this.billingService.getBillingStats();
  }
}
