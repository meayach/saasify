import { AutoMap } from '@automapper/classes';

export class GetPaymentsConfigurationDTO {
  @AutoMap()
  saasClientId: string;

  @AutoMap()
  saasRealmId: string;
}
