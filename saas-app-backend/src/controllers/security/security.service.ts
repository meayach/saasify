import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SecuritySettings,
  SecuritySettingsDocument,
} from '../../data/models/securitySettings/security-settings.schema';
import { AuditLog, AuditLogDocument } from '../../data/models/auditLog/audit-log.schema';
import { UpdateSecuritySettingsDto } from './dto/security.dto';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  constructor(
    @InjectModel(SecuritySettings.name)
    private securitySettingsModel: Model<SecuritySettingsDocument>,
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async getSettings(): Promise<SecuritySettings> {
    let settings = await this.securitySettingsModel.findOne().exec();

    if (!settings) {
      // Créer des paramètres par défaut
      const defaultSettings = new this.securitySettingsModel({
        twoFactorEnabled: false,
        sessionTimeout: 120,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
        },
        auditLogEnabled: true,
        loginAttempts: {
          maxAttempts: 5,
          lockoutDuration: 30,
        },
        allowedIpRanges: [],
        apiAccessEnabled: true,
        webhookUrls: [],
      });

      settings = await defaultSettings.save();
    }

    return settings;
  }

  async updateSettings(updateDto: UpdateSecuritySettingsDto): Promise<SecuritySettings> {
    let settings = await this.securitySettingsModel.findOne().exec();

    if (!settings) {
      settings = new this.securitySettingsModel(updateDto);
    } else {
      Object.assign(settings, updateDto);
    }

    return settings.save();
  }

  async getAuditLogs(
    page = 1,
    limit = 50,
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogModel.find().sort({ timestamp: -1 }).skip(skip).limit(limit).exec(),
      this.auditLogModel.countDocuments().exec(),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createAuditLog(logData: {
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    details?: any;
  }): Promise<AuditLog> {
    const auditLog = new this.auditLogModel({
      ...logData,
      timestamp: new Date(),
    });

    return auditLog.save();
  }

  async test2FA(code: string): Promise<{ valid: boolean }> {
    // Simulation de validation 2FA
    // Dans un vrai projet, ceci validerait avec Google Authenticator ou similaire
    const isValid = code === '123456'; // Code de test

    return { valid: isValid };
  }

  async generateApiKey(): Promise<{ apiKey: string }> {
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Dans un vrai projet, sauvegarder la clé API dans la base de données
    // avec l'utilisateur associé, les permissions, etc.

    return { apiKey };
  }

  async revokeApiKey(apiKeyId: string): Promise<void> {
    // Dans un vrai projet, marquer la clé API comme révoquée dans la base
    console.log(`API Key ${apiKeyId} revoked`);
  }
}
