import { Module } from '@nestjs/common';
import { mapperServiceConfigs, mapperServices } from '.';

@Module({
  imports: [],
  controllers: [],
  providers: [...mapperServices, ...mapperServiceConfigs],
  exports: [...mapperServiceConfigs, ...mapperServices],
})
export class MapperServiceModule {}
