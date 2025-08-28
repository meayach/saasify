import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasOfferDocument, SaasOfferPOJO } from '@Data/models/saasOffer/saasOffer.pojo.model';
import { SaasPlanPOJO } from '@Data/models/saasPlan/saasPlan.pojo.model';

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
    const offer: SaasOfferPOJO = await this.saasOfferModel
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
    const plan: SaasPlanPOJO = offer.plans[0];
    return plan;
  }

  async createOffer(saasOfferPOJO: Partial<SaasOfferPOJO>): Promise<SaasOfferPOJO> {
    const created = await this.saasOfferModel.create(saasOfferPOJO);
    return created.toObject();
  }

  async findByApplication(applicationId: string): Promise<SaasOfferPOJO[]> {
    return this.saasOfferModel.find({ saasApplication: applicationId }).lean().exec();
  }
}
