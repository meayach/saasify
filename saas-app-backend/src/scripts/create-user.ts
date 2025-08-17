import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SaasCustomerAdminRepository } from '../data/saasCustomerAdmin/repository/SaasCustomerAdmin.repository';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get(SaasCustomerAdminRepository);

  try {
    const user = await repo.createCustomerAdmin({
      firstName: 'Raja',
      lastName: 'Rajaoui',
      email: 'raja@gmail.com',
      phoneNumber: '+33 6 12 34 56 78',
      streetAddress: '10 Rue de Paris',
      city: 'Paris',
      zipCode: '75001',
      role: 'END_USER',
    });
    console.log('Created user', user);
  } catch (e) {
    console.error('Error creating user', e);
  } finally {
    await app.close();
  }
}

bootstrap();
