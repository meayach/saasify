import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PaymentManagerMapper } from '@Services/mappers/payment-manager/payment-manager.mapper';
import { PaymentsConfigResultsDTO } from '@Services/dto/payment/get-client-id.dto';
import { GetPaymentsConfigurationDTO } from '@Services/dto/payment/get-payment-configuration.dto';
import { SaasWorkspacePaymentsRepository } from '@Data/saasworkspace/repository/saas-workspace-payments.repository';

@Injectable()
export class PaymentManager {
  constructor(
    private paymentManagerMapper: PaymentManagerMapper,

    private readonly saasWorkspacePaymentRepository: SaasWorkspacePaymentsRepository,
  ) {}

  async getPaymentsConfigurations(
    getPaymentsConfigurationDTO: GetPaymentsConfigurationDTO,
  ): Promise<PaymentsConfigResultsDTO[]> {
    return this.paymentManagerMapper.mapFromSaasWorkspacePOJOToPaymentsConfigResultsDTO(
      await this.saasWorkspacePaymentRepository.getPaymentsConfigFromWorkspace(
        getPaymentsConfigurationDTO.saasRealmId,
        getPaymentsConfigurationDTO.saasClientId,
      ),
    );
  }
}
