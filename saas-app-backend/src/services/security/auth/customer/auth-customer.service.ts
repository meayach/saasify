import { SaasCustomerAdminRepository } from '@Data/saasCustomerAdmin/repository/SaasCustomerAdmin.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.saasCustomerAdminRepository.findByEmail(
      customerSignUpDTO.email,
    );
    if (existingUser) {
      throw new HttpException('Un utilisateur avec cet email existe déjà', HttpStatus.CONFLICT);
    }

    customerSignUpDTO.password = AuthCryptageHelper.encryptWithAES(customerSignUpDTO.password);
    await this.saasCustomerAdminRepository.createCustomerAdmin(
      this.customerAdminServiceMapper.mapcustomerSignUpDTOToSaasCustomerAdminPOJO(
        customerSignUpDTO,
      ),
    );
  }

  async login(email: string, password: string) {
    // Vérifier si l'utilisateur existe
    const user = await this.saasCustomerAdminRepository.findByEmail(email);
    if (!user) {
      throw new HttpException('Email ou mot de passe incorrect', HttpStatus.UNAUTHORIZED);
    }

    // Chiffrer le mot de passe saisi pour le comparer
    const encryptedPassword = AuthCryptageHelper.encryptWithAES(password);
    if (user.password !== encryptedPassword) {
      throw new HttpException('Email ou mot de passe incorrect', HttpStatus.UNAUTHORIZED);
    }

    // Retourner les informations utilisateur pour le dashboard
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };
  }
}
