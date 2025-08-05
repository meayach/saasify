import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasOfferDocument, SaasOfferPOJO } from '@Data/models/saasOffer/saasOffer.pojo.model';
import { SaasPlanPOJO } from '@Data/models/saasPlan/saasPlan.pojo.model';
import { GetPlanFromOfferDTO } from '@Services/dto/plan/get-offer-from-offer.dto';

@Injectable()
export class SaasOfferRepository {
  constructor(
    @InjectModel(SaasOfferPOJO.name)
    private saasOfferModel: Model<SaasOfferDocument>,
  ) {}

  async getPlanFromOffer(
    offerId: mongoose.Types.ObjectId,
    planName: string,
  ): Promise<SaasPlanPOJO | null> {
    let offer: SaasOfferPOJO = await this.saasOfferModel
      .findById(offerId)
      .select('plans')
      .populate({
        path: 'plans',
        select: 'planName',
        match: { planName: planName },
      });
    if (!offer || !offer.plans || offer.plans.length === 0) {
      return null;
    }
    let plan: SaasPlanPOJO = offer.plans[0];
    return plan;
  }
}
