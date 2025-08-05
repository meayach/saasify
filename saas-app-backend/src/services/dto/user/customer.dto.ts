import { AutoMap } from '@automapper/classes';

export class CustomerSignUpDTO {
  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  email: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  streetAddress: string;

  @AutoMap()
  city: string;

  @AutoMap()
  zipCode: number;

  @AutoMap()
  password: string;

  @AutoMap()
  plan: string;

  @AutoMap()
  role: string;
}
