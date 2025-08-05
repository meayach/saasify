import { SaasCustomerAdminRepository } from '@Data/saasCustomerAdmin/repository/SaasCustomerAdmin.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserServiceMapper } from '@Services/mappers/user/user-service.mapper';
import { AuthCryptageHelper } from '../helpers/auth.cryptage';
import { CustomerAdminServiceMapper } from '@Services/mappers/customer-admin/customer-admin-service.mapper';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';

@Injectable()
export class AuthCustomerService {
  HOST: string;
  constructor(
    private readonly customerAdminServiceMapper: CustomerAdminServiceMapper,
    private readonly saasCustomerAdminRepository: SaasCustomerAdminRepository,
  ) {}

  async signup(customerSignUpDTO: CustomerSignUpDTO) {
    customerSignUpDTO.password = AuthCryptageHelper.encryptWithAES(customerSignUpDTO.password);
    await this.saasCustomerAdminRepository.createCustomerAdmin(
      this.customerAdminServiceMapper.mapcustomerSignUpDTOToSaasCustomerAdminPOJO(
        customerSignUpDTO,
      ),
    );
  }
}
