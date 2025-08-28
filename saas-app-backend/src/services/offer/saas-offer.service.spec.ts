import { Test, TestingModule } from '@nestjs/testing';
import { SaasOfferService } from './saas-offer.service';
import { SaasOfferRepository } from '@Data/saasOffer/repository/saasOffer.repository';
import { SaasApplicationRepository } from '@Data/saasApplication/repository/saasApplication.repository';
import { NotFoundException } from '@nestjs/common';

describe('SaasOfferService', () => {
  let service: SaasOfferService;
  const mockSaasOfferRepository = {
    createOffer: jest.fn(),
    findByApplication: jest.fn(),
  };
  const mockSaasAppRepository = {
    getSaasApplicationById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaasOfferService,
        { provide: SaasOfferRepository, useValue: mockSaasOfferRepository },
        { provide: SaasApplicationRepository, useValue: mockSaasAppRepository },
      ],
    }).compile();

    service = module.get<SaasOfferService>(SaasOfferService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create offer when application exists', async () => {
    const validAppId = '64b8f0c4a3f1e0a1b2c3d4e5';
    mockSaasAppRepository.getSaasApplicationById.mockResolvedValue({ _id: validAppId });
    mockSaasOfferRepository.createOffer.mockResolvedValue({
      _id: '64b8f0c4a3f1e0a1b2c3d4f6',
      offerName: 'O',
      saasApplication: validAppId,
      plans: [],
    });

    const dto: any = { offerName: 'O', saasApplicationId: validAppId, plans: [] };
    const res = await service.createOffer(dto);

    expect(res.offerName).toBe('O');
    expect(mockSaasOfferRepository.createOffer).toHaveBeenCalled();
  });

  it('should throw NotFoundException when application missing', async () => {
    mockSaasAppRepository.getSaasApplicationById.mockResolvedValue(null);
    await expect(
      service.createOffer({ offerName: 'O', saasApplicationId: 'nope', plans: [] }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return offers for application', async () => {
    mockSaasOfferRepository.findByApplication.mockResolvedValue([
      { _id: 'o1', offerName: 'O1', saasApplication: 'appid', plans: [] },
    ]);
    const res = await service.findByApplication('appid');
    expect(res).toHaveLength(1);
    expect(res[0].offerName).toBe('O1');
  });
});
