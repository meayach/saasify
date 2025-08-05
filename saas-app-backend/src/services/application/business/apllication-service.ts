import { SaasApplicationRepository } from '@Data/saasApplication/repository/saasApplication.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApplicationService {
  constructor(private readonly applicationRepository: SaasApplicationRepository) {}
}
