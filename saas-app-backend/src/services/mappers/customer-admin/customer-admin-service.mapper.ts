import { Injectable } from '@nestjs/common';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';

@Injectable()
export class CustomerAdminServiceMapper {
  mapcustomerSignUpDTOToSaasCustomerAdminPOJO(customerSignUpDTO: CustomerSignUpDTO): any {
    return {
      firstName: customerSignUpDTO.firstName,
      lastName: customerSignUpDTO.lastName,
      email: customerSignUpDTO.email,
      phoneNumber: customerSignUpDTO.phoneNumber,
      streetAddress: customerSignUpDTO.streetAddress,
      city: customerSignUpDTO.city,
      zipCode: customerSignUpDTO.zipCode,
      password: customerSignUpDTO.password,
      plan: customerSignUpDTO.plan,
      role: customerSignUpDTO.role,
    };
  }
}
