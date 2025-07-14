import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { ErrorCodes } from './error-codes.enum';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockHttpArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test-url',
    };

    mockHttpArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should log error details with correct module name', () => {
    const loggerSpy = jest.spyOn(filter['logger'], 'error');
    const exception = new Error('Test error');
    exception.stack = `Error: Test error
    at Object.<anonymous> (/path/to/your/project/src/some-module.ts:10:20)
    at Module._compile (internal/modules/cjs/loader.js:1138:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1158:10)`;
    
    filter.catch(exception, mockHttpArgumentsHost);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error in some-module.ts'),
      undefined,
      'some-module.ts'
    );
  });

  it('should handle unknown module names', () => {
    const loggerSpy = jest.spyOn(filter['logger'], 'error');
    const exception = new Error('Test error');
    exception.stack = undefined;
    
    filter.catch(exception, mockHttpArgumentsHost);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error in Unknown Module'),
      undefined,
      'Unknown Module'
    );
  });
});