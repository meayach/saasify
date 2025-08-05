import { AutoMap } from '@automapper/classes';
import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength, IsIn } from 'class-validator';

export class CustomerSignUpWO {
  @IsNotEmpty()
  @IsString()
  @AutoMap()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @AutoMap()
  email: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  streetAddress: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  city: string;

  @IsNotEmpty()
  @IsNumber()
  @AutoMap()
  zipCode: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @AutoMap()
  password: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  plan: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['customer', 'admin', 'manager'])
  @AutoMap()
  role: string;
}
