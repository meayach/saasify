import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap } from '@automapper/core';
import { SaasPaymentMethodConfigurationPOJO } from '@Data/models/saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.pojo.model';
import { PaymentsConfigResultsDTO } from '@Services/dto/payment/get-client-id.dto';
import { GetPaymentsConfigurationDTO } from '@Services/dto/payment/get-payment-configuration.dto';

@Injectable()
export class PaymentManagerMapperConfig extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // new
      createMap(mapper, SaasPaymentMethodConfigurationPOJO, PaymentsConfigResultsDTO);
    };
  }
}
