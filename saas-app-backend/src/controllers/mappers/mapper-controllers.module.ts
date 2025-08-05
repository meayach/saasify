import { Module } from '@nestjs/common';
import { mapperControllers, mapperControllersConfigs } from '.';

@Module({
  imports: [],
  controllers: [],
  providers: [...mapperControllers, ...mapperControllersConfigs],
  exports: [...mapperControllers, ...mapperControllersConfigs],
})
export class MapperControllersModule {}
