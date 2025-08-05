import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SaasPlanPOJO, SaasPlanSchema } from '@Data/models/saasPlan/saasPlan.pojo.model';
import { SaasPlanRepository } from './repository/saasPlan.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasPlanPOJO.name,
        schema: SaasPlanSchema,
        collection: 'SaasPlans',
      },
    ]),
  ],
  providers: [SaasPlanRepository],
  exports: [SaasPlanRepository],
})
export class SaasPlanDataModule {}
