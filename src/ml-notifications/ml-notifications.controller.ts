import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MLNotificationsService } from '@src/ml-notifications/ml-notifications.service';

@Controller('ml-notifications')
@ApiTags('ML Notifications')
export class MLNotificationsController {
  constructor(private readonly mlNotificationsService: MLNotificationsService) {}

  @Post()
  @HttpCode(200)
  async handleNotification(@Body() notification: any) {
    setTimeout(async () => {
      try {
        await this.mlNotificationsService.handleNotification(notification);
        return { message: 'Notification processed successfully' };  
      } catch (error) {       
        return { message: 'Failed to process notification', error: error.message };
      }
    }, 0);
  }

  @Post('shipment-label')
  @HttpCode(200)
  async getShipmentLabel(@Body() body: { shipmentId: string; store_id: number }) {
    const { shipmentId, store_id } = body;
    try {
      const labelData = await this.mlNotificationsService.getShipmentLabel(shipmentId, store_id);
      return { message: 'Shipment label fetched successfully', data: labelData };
    } catch (error) {
      return { message: 'Failed to fetch shipment label', error: error.message };
    }
  }

  @Post('shipment-qrcode')
  @HttpCode(200)
  async getShipmentQRCode(@Body() body: { shipmentId: string; store: number }) {
    const { shipmentId, store } = body;
    try {
      const qrCodeData = await this.mlNotificationsService.getShipmentQRCode(shipmentId, store);
      return { message: 'Shipment QR code fetched successfully', data: qrCodeData };
    } catch (error) {
      return { message: 'Failed to fetch shipment QR code', error: error.message };
    }
  }
}
