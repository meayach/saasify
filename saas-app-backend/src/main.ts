import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Servir les fichiers statiques (uploads)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL', 'http://localhost:4200'),
      'http://localhost:4200',
      'http://localhost:4201', // Add port 4201 for Angular dev server
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'), {
    exclude: ['/'],
  });

  // Route de bienvenue pour la racine
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'SaaS Platform API is running!',
      version: '1.0.0',
      documentation: '/api/docs',
      api: '/api/v1',
      endpoints: {
        users: '/api/v1/users',
        applications: '/api/v1/applications',
        plans: '/api/v1/plans',
        subscriptions: '/api/v1/subscriptions',
        payments: '/api/v1/payments',
      },
    });
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE', 'SaaS Platform API'))
    .setDescription(
      configService.get('SWAGGER_DESCRIPTION', 'API documentation for the SaaS Platform'),
    )
    .setVersion(configService.get('SWAGGER_VERSION', '1.0.0'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
