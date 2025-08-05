import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SaasOfferPOJO, SaasOfferSchema } from '@Data/models/saasOffer/saasOffer.pojo.model';
import { SaasOfferRepository } from './repository/saasOffer.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasOfferPOJO.name,
        schema: SaasOfferSchema,
        collection: 'SaasOffers',
      },
    ]),
  ],
  providers: [SaasOfferRepository],
  exports: [SaasOfferRepository],
})
export class SaasOfferDataModule {}
