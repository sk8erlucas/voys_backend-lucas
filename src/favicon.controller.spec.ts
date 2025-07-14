import { Test, TestingModule } from '@nestjs/testing';
import { FaviconController } from './favicon.controller';
import { Response } from 'express';

describe('FaviconController', () => {
  let controller: FaviconController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaviconController],
    }).compile();

    controller = module.get<FaviconController>(FaviconController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('handleFavicon', () => {
    it('debe devolver un estado 204', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      controller.handleFavicon(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('getError', () => {
    it('debe lanzar un error', () => {
      expect(() => controller.getError()).toThrow('My first Sentry error!');
    });
  });
});
