import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { UpdateSecuritySettingsDto } from './dto/security.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Security')
@Controller('api/security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get security settings' })
  @ApiResponse({ status: 200, description: 'Security settings retrieved successfully' })
  async getSettings() {
    try {
      const settings = await this.securityService.getSettings();
      return {
        success: true,
        data: settings,
        message: 'Paramètres de sécurité récupérés avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors du chargement des paramètres de sécurité',
      };
    }
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({ status: 200, description: 'Security settings updated successfully' })
  async updateSettings(@Body() updateDto: UpdateSecuritySettingsDto) {
    try {
      console.log('SecurityController: Données reçues pour mise à jour:', updateDto);
      const updatedSettings = await this.securityService.updateSettings(updateDto);
      return {
        success: true,
        data: updatedSettings,
        message: 'Paramètres de sécurité mis à jour avec succès',
      };
    } catch (error) {
      console.error('SecurityController: Erreur lors de la mise à jour:', error);
      throw new HttpException(
        {
          success: false,
          data: null,
          message: error.message || 'Erreur lors de la sauvegarde des paramètres de sécurité',
        },
        400,
      );
    }
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    try {
      const auditLogs = await this.securityService.getAuditLogs(page, limit);
      return {
        success: true,
        data: auditLogs,
        message: "Logs d'audit récupérés avec succès",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || "Erreur lors du chargement des logs d'audit",
      };
    }
  }

  @Post('test-2fa')
  @ApiOperation({ summary: 'Test 2FA code' })
  @ApiResponse({ status: 200, description: '2FA code validated' })
  async test2FA(@Body('code') code: string) {
    try {
      const result = await this.securityService.test2FA(code);
      return {
        success: true,
        data: result,
        message: 'Code 2FA validé avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors de la validation du code 2FA',
      };
    }
  }

  @Post('generate-api-key')
  @ApiOperation({ summary: 'Generate new API key' })
  @ApiResponse({ status: 201, description: 'API key generated successfully' })
  async generateApiKey() {
    try {
      const apiKey = await this.securityService.generateApiKey();
      return {
        success: true,
        data: apiKey,
        message: 'Clé API générée avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors de la génération de la clé API',
      };
    }
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  async revokeApiKey(@Param('id') apiKeyId: string) {
    try {
      await this.securityService.revokeApiKey(apiKeyId);
      return {
        success: true,
        data: null,
        message: 'Clé API révoquée avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors de la révocation de la clé API',
      };
    }
  }
}
