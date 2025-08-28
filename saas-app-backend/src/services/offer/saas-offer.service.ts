import { Injectable, NotFoundException } from '@nestjs/common';
import { SaasOfferRepository } from '@Data/saasOffer/repository/saasOffer.repository';
import { SaasApplicationRepository } from '@Data/saasApplication/repository/saasApplication.repository';
import { CreateSaasOfferDto, SaasOfferResponseDto } from '../dto/saas-offer.dto';
import mongoose from 'mongoose';

@Injectable()
export class SaasOfferService {
  constructor(
    private readonly saasOfferRepository: SaasOfferRepository,
    private readonly saasApplicationRepository: SaasApplicationRepository,
  ) {}

  async createOffer(dto: CreateSaasOfferDto): Promise<SaasOfferResponseDto> {
    // validate application exists
    const app = await this.saasApplicationRepository.getSaasApplicationById(dto.saasApplicationId);
    if (!app) throw new NotFoundException('SaasApplication not found');

    // build POJO
    const pojo: any = {
      offerName: dto.offerName,
      saasApplication: new mongoose.Types.ObjectId(dto.saasApplicationId),
      plans:
        dto.plans && dto.plans.length > 0
          ? dto.plans.map((p) => new mongoose.Types.ObjectId(p))
          : [],
    };

    // Use repository to create the offer
    const created = await this.saasOfferRepository.createOffer(pojo);
    return {
      _id: String(created._id),
      offerName: created.offerName,
      saasApplication: created.saasApplication,
      plans: created.plans || [],
    } as SaasOfferResponseDto;
  }

  async findByApplication(applicationId: string): Promise<SaasOfferResponseDto[]> {
    const offers = await this.saasOfferRepository.findByApplication(applicationId);
    return offers.map((o: any) => ({
      _id: o._id,
      offerName: o.offerName,
      saasApplication: o.saasApplication,
      plans: o.plans || [],
    }));
  }
}
