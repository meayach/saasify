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
  // Use process.cwd() so that the runtime serves the uploads directory
  // regardless of whether the app is running from the compiled `dist` folder
  // or directly from the TS sources in development.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
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
  // Listen on all interfaces to avoid binding issues between localhost/127.0.0.1/::1
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://0.0.0.0:${port}`);
  console.log(`📚 Swagger documentation: http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
