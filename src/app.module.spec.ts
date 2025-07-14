import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let appModule: AppModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appModule = module.get<AppModule>(AppModule);
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  it('should have imports', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toBeDefined();
    expect(imports.length).toBeGreaterThan(0);
  });

  it('should have controllers', () => {
    const controllers = Reflect.getMetadata('controllers', AppModule);
    expect(controllers).toBeDefined();
    expect(controllers.length).toBeGreaterThan(0);
    expect(controllers[0]).toBeInstanceOf(Function);
  });

  it('should have providers', () => {
    const providers = Reflect.getMetadata('providers', AppModule);
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
  });
});
