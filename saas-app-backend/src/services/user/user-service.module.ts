import { UserDataModule } from '@Data/user/user.data.module';
import { Module } from '@nestjs/common';
import { MapperServiceModule } from '@Services/mappers/mapper-service.module';
import { UserService } from './business/user.service';

@Module({
  imports: [MapperServiceModule, UserDataModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserServiceModule {}
