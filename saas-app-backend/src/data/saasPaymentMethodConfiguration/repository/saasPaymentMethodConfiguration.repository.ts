import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasPaymentMethodConfigurationDocument,
  SaasPaymentMethodConfigurationPOJO,
} from '@Data/models/saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.pojo.model';

@Injectable()
export class SaasPaymentMethodConfigurationRepository {
  constructor(
    @InjectModel(SaasPaymentMethodConfigurationPOJO.name)
    private saasPaymentMethodConfigurationModel: Model<SaasPaymentMethodConfigurationDocument>,
  ) {}

  async getPaymentConfig(paymentMethod: string): Promise<SaasPaymentMethodConfigurationPOJO> {
    const saasPaymentMethodConfigurationPOJO: SaasPaymentMethodConfigurationPOJO =
      await this.saasPaymentMethodConfigurationModel.findOne({
        provider: paymentMethod,
      });
    return saasPaymentMethodConfigurationPOJO;
  }
}
