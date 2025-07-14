import * as Sentry from "@sentry/nestjs";

// Mock directo del módulo @sentry/profiling-node
jest.mock("@sentry/profiling-node", () => ({
  nodeProfilingIntegration: jest.fn().mockReturnValue({ name: 'nodeProfilingIntegration' })
}));

jest.mock("@sentry/nestjs");

// Importar el mock después del jest.mock
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

describe('Configuración de Sentry', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.isolateModules(() => {
      require('./sentry.configuration');
    });
  });

  it('debe inicializar Sentry con la configuración correcta', () => {
    expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
      dsn: "https://366196fe608096e87247415a5958409b@o4504265196240896.ingest.us.sentry.io/4508036788453376",
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    }));
  });

  it('debe incluir la integración de nodeProfilingIntegration', () => {
    // Verificar que la función nodeProfilingIntegration fue llamada
    expect(nodeProfilingIntegration).toHaveBeenCalled();
    
    const initCall = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(initCall.integrations).toBeDefined();
    expect(Array.isArray(initCall.integrations)).toBe(true);
    expect(initCall.integrations.length).toBeGreaterThan(0);
  });

  it('debe configurar tracesSampleRate al 100%', () => {
    const initCall = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(initCall.tracesSampleRate).toBe(1.0);
  });

  it('debe configurar profilesSampleRate al 100%', () => {
    const initCall = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(initCall.profilesSampleRate).toBe(1.0);
  });
});