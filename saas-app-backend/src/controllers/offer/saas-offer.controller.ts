import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SaasOfferService } from '@Services/offer/saas-offer.service';
import { CreateSaasOfferDto } from '@Services/dto/saas-offer.dto';

@Controller('saas-offers')
export class SaasOfferController {
  constructor(private readonly offerService: SaasOfferService) {}

  @Post()
  async create(@Body() dto: CreateSaasOfferDto) {
    const created = await this.offerService.createOffer(dto);
    return created;
  }

  @Get('application/:id')
  async findByApplication(@Param('id') id: string) {
    return await this.offerService.findByApplication(id);
  }
}
