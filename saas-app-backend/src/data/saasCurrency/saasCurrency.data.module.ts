import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  SaasCurrencyPOJO,
  SaasCurrencySchema,
} from '@Data/models/saasCurrency/saasCurrency.pojo.model';
import { SaasCurrencyRepository } from './repository/saasCurrency.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasCurrencyPOJO.name,
        schema: SaasCurrencySchema,
        collection: 'SaasCurrencys',
      },
    ]),
  ],
  providers: [SaasCurrencyRepository],
  exports: [SaasCurrencyRepository],
})
export class SaasCurrencyDataModule {}
