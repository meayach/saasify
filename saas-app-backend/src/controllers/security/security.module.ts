import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import {
  SecuritySettings,
  SecuritySettingsSchema,
} from '../../data/models/securitySettings/security-settings.schema';
import { AuditLog, AuditLogSchema } from '../../data/models/auditLog/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecuritySettings.name, schema: SecuritySettingsSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
