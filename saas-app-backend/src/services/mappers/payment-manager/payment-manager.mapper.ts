import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { SaasPaymentMethodConfigurationPOJO } from '@Data/models/saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.pojo.model';
import { PaymentsConfigResultsDTO } from '@Services/dto/payment/get-client-id.dto';
import { SaasWorkspacePOJO } from '@Data/models/saasworkspace/saasWorkspace.pojo.model';
import { GetPaymentsConfigurationDTO } from '@Services/dto/payment/get-payment-configuration.dto';

@Injectable()
export class PaymentManagerMapper {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {}

  mapFromSaasWorkspacePOJOToPaymentsConfigResultsDTO(
    saasWorkspacePOJO: SaasWorkspacePOJO,
  ): PaymentsConfigResultsDTO[] {
    if (!saasWorkspacePOJO) throw new HttpException('invalid saasRealmId ', HttpStatus.BAD_GATEWAY);

    if (saasWorkspacePOJO.applications.length != 1)
      throw new HttpException('invalid saasClientId', HttpStatus.BAD_GATEWAY);

    const saasPaymentMethodConfiguration: SaasPaymentMethodConfigurationPOJO[] =
      saasWorkspacePOJO.applications[0].applicationConfiguration.paymentMethodConfigurations;
    if (!saasPaymentMethodConfiguration.length)
      throw new HttpException('invalid payment provider clientid', HttpStatus.BAD_GATEWAY);

    return this.classMapper.mapArray(
      saasPaymentMethodConfiguration,
      SaasPaymentMethodConfigurationPOJO,
      PaymentsConfigResultsDTO,
    );
  }
}
