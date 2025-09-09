import { Module } from '@nestjs/common';
import { FeatureDataModule } from '../../data/feature/feature.data.module';
import { FeatureController } from './feature.controller';
import { PlanFeatureController } from './plan-feature.controller';

@Module({
  imports: [FeatureDataModule],
  controllers: [FeatureController, PlanFeatureController],
})
export class FeatureModule {}
