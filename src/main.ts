import './sentry.configuration';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const debugUrl = configService.get<string>('DEBUG_URL');

  // ✅ CORS configurado con el valor desde .env
  app.enableCors({
    origin:
      [frontendUrl, debugUrl].filter(Boolean).length > 0
        ? [frontendUrl, debugUrl].filter(Boolean)
        : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', '*'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Voys API')
    .setDescription('Voys API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  const port = configService.get('PORT');
  await app.listen(port ?? 9000, '0.0.0.0');

  console.log(`APP Running on http://localhost:${port}`);
}

// Si este archivo se ejecuta directamente (no importado), ejecuta bootstrap
if (require.main === module) {
  bootstrap();
}
