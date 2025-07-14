import { Test, TestingModule } from '@nestjs/testing';
import { MLNotificationsController } from './ml-notifications.controller';
import { MLNotificationsService } from './ml-notifications.service';

describe('MLNotificationsController', () => {
  let controller: MLNotificationsController;
  let service: MLNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MLNotificationsController],
      providers: [
        {
          provide: MLNotificationsService,
          useValue: {
            handleNotification: jest.fn(),
            getShipmentLabel: jest.fn(),
            getShipmentQRCode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MLNotificationsController>(MLNotificationsController);
    service = module.get<MLNotificationsService>(MLNotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleNotification', () => {
    it('should return undefined immediately', async () => {
      const notification = { type: 'test', data: 'test data' };
      const result = await controller.handleNotification(notification);
      expect(result).toBeUndefined();
    });

    it('should process notification asynchronously', async () => {
      const notification = { type: 'test', data: 'test data' };
      (service.handleNotification as jest.Mock).mockResolvedValue(undefined);

      controller.handleNotification(notification);

      // Wait for the next tick of the event loop
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(service.handleNotification).toHaveBeenCalledWith(notification);
    });

    it('should handle errors when processing notification asynchronously', async () => {
      const notification = { type: 'test', data: 'test data' };
      const error = new Error('Test error');
      (service.handleNotification as jest.Mock).mockRejectedValue(error);

      // No debería lanzar un error
      await expect(controller.handleNotification(notification)).resolves.toBeUndefined();

      // Wait for the next tick of the event loop
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(service.handleNotification).toHaveBeenCalledWith(notification);
    });
  });

  describe('getShipmentLabel', () => {
    it('should return shipment label successfully', async () => {
      const body = { shipmentId: '123', store_id: 1 };
      const labelData = { label: 'Label Data' };
      (service.getShipmentLabel as jest.Mock).mockResolvedValue(labelData);

      const result = await controller.getShipmentLabel(body);
      expect(result).toEqual({ message: 'Shipment label fetched successfully', data: labelData });
      expect(service.getShipmentLabel).toHaveBeenCalledWith(body.shipmentId, body.store_id);
    });

    it('should handle errors when fetching shipment label', async () => {
      const body = { shipmentId: '123', store_id: 1 };
      const error = new Error('Test error');
      (service.getShipmentLabel as jest.Mock).mockRejectedValue(error);

      const result = await controller.getShipmentLabel(body);
      expect(result).toEqual({ message: 'Failed to fetch shipment label', error: error.message });
    });
  });

  describe('getShipmentQRCode', () => {
    it('should return shipment QR code successfully', async () => {
      const body = { shipmentId: '123', store: 1 };
      const qrCodeData = { qrCode: 'QRCode Data' };
      (service.getShipmentQRCode as jest.Mock).mockResolvedValue(qrCodeData);

      const result = await controller.getShipmentQRCode(body);
      expect(result).toEqual({ message: 'Shipment QR code fetched successfully', data: qrCodeData });
      expect(service.getShipmentQRCode).toHaveBeenCalledWith(body.shipmentId, body.store);
    });

    it('should handle errors when fetching shipment QR code', async () => {
      const body = { shipmentId: '123', store: 1 };
      const error = new Error('Test error');
      (service.getShipmentQRCode as jest.Mock).mockRejectedValue(error);

      const result = await controller.getShipmentQRCode(body);
      expect(result).toEqual({ message: 'Failed to fetch shipment QR code', error: error.message });
    });
  });
});
