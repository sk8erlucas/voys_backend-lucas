// Añadir los mocks de Sentry al principio, antes de cualquier otro import
jest.mock('@sentry/nestjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  close: jest.fn()
}));

jest.mock('@sentry/profiling-node', () => ({
  nodeProfilingIntegration: jest.fn()
}));

// Opcional: mockear también la configuración de Sentry si existe
jest.mock('./sentry.configuration', () => ({
  // Proporciona cualquier función que se importe de este módulo
  default: jest.fn(),
  initializeSentry: jest.fn()
}));

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

jest.mock('@nestjs/swagger');
jest.mock('./app.module', () => ({
  AppModule: class {}
}));

describe('Bootstrap function', () => {
  let app: jest.Mocked<NestFastifyApplication>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    app = {
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      get: jest.fn().mockReturnValue(configService),
      listen: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NestFastifyApplication>;

    const createSpy = jest.spyOn(NestFactory, 'create');
    createSpy.mockResolvedValue(app);

    jest.spyOn(DocumentBuilder.prototype, 'setTitle').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'setDescription').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'setVersion').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'addBearerAuth').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'build').mockReturnValue({} as any);

    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({});
    SwaggerModule.setup = jest.fn();

    // Capturar la llamada a console.log
    jest.spyOn(console, 'log');

    // Importar main.ts y esperar a que se complete la función bootstrap
    const main = await import('./main');
    await main.bootstrap();
  });

  it('debe crear la aplicación y configurarla correctamente', async () => {
    expect(app.enableCors).toHaveBeenCalledWith({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Authorization', '*'],
      credentials: true,
    });
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(DocumentBuilder.prototype.setTitle).toHaveBeenCalledWith('Voys API');
    expect(DocumentBuilder.prototype.setDescription).toHaveBeenCalledWith('Voys API documentation');
    expect(DocumentBuilder.prototype.setVersion).toHaveBeenCalledWith('1.0');
    expect(DocumentBuilder.prototype.addBearerAuth).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith('swagger', app, expect.any(Object));
  });

  it('debe intentar iniciar el servidor', async () => {
    expect(app.listen).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('APP Running on http://localhost'));
  });
});
