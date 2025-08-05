import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { CustomerSignUpWO } from '@Controllers/wo/customer-signup.wo';
import { Injectable } from '@nestjs/common';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';

@Injectable()
export class CustomerControllerMapper {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {}

  mapFromCustomerSignUpWOTOCustomerSignUpDTO(user: CustomerSignUpWO): CustomerSignUpDTO {
    return this.classMapper.map(user, CustomerSignUpWO, CustomerSignUpDTO);
  }
}
