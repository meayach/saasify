import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  SaasPricingPOJO,
  SaasPricingSchema,
} from '@Data/models/saasPricing/saasPricing.pojo.model';
import { SaasPricingRepository } from './repository/saasPricing.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasPricingPOJO.name,
        schema: SaasPricingSchema,
        collection: 'SaasPricings',
      },
    ]),
  ],
  providers: [SaasPricingRepository],
  exports: [SaasPricingRepository],
})
export class SaasPricingDataModule {}
