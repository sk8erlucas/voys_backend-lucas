import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaService } from '@src/prisma/prisma.service';
import { MLAuthService } from '@src/ml-auth/ml-auth.service';
import { PackagesService } from '@src/_packages/_packages.service';
import axios from 'axios';
import { format } from 'date-fns';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { fromPath } from 'pdf2pic';
import jsQR = require('jsqr');
import {Jimp} from 'jimp';
import { parseISO } from 'date-fns';


@Injectable()
export class MLNotificationsService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mlAuthService: MLAuthService,
    private packagesService: PackagesService,
  ) {}

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  /*========================================
  HANDLE NOTIFICATION
  ========================================*/
  async handleNotification(notification: any): Promise<void> {
    const resource = notification.resource;
    const ml_user_id = String(notification.user_id);
    console.log(notification, 'notification')

    let processNotification = false

    let shipmentData = null;
    let orderData = null;
    let orderId = null;
    let trackingId = null;

    const store = await this.prisma.store.findUnique({
      where: { ml_user_id: ml_user_id},
    });

    if (!store) {
      throw new Error(`Store not found for notification: ${JSON.stringify(notification)}`);
    }
    const tokenData = await this.mlAuthService.getValidToken(store.id);

    /*========================================
    HANDLE SHIPMENT NOTIFICATION 
    ========================================*/
    if(resource.includes('/shipments/')) {
      trackingId = resource.split('/').pop();

      shipmentData = await this.getShipmentData(trackingId, tokenData.ml_access_token);

      //get order data
      orderId = shipmentData.order_id;
      orderData = await this.getOrderData(orderId, tokenData.ml_access_token);

      processNotification = true
    }
    
    /*========================================
    HANDLE ORDER NOTIFICATION
    ========================================*/
    if (resource.includes('/orders/')) {
      orderId = resource.split('/').pop();

      
      orderData = await this.getOrderData(orderId, tokenData.ml_access_token);
      trackingId = String(orderData.shipping.id);
      shipmentData = await this.getShipmentData(trackingId, tokenData.ml_access_token);

      processNotification = true
    }


    /*========================================
    IF PROCESS NOTIFICATION IS TRUE
    ========================================*/
    if (processNotification) {

      const voysStatusData = await this.prisma.voysStatus.findMany();
      let voysStatus = '';

      for (const status of voysStatusData) {
        const ml_status_array = JSON.parse(status.ml_status_array);
        if (ml_status_array.includes(String(shipmentData.status))) {
          voysStatus = status.slug;
          break;
        }
      }

      console.log('orderData-------------->', orderData)
      console.log('shipmentData-------------->', shipmentData)

      const orderDate = new Date(orderData.date_created);

      await this.prisma.package.upsert({
        where: { ml_order_id: orderId },
        update: {
          ml_tracking_id: String(shipmentData.id),
          ml_status: String(shipmentData.status),
          ml_substatus: shipmentData.substatus,
          ml_receiver_name: shipmentData.receiver_address.receiver_name,
          ml_order_date: orderDate,
          voys_status: voysStatus,
          ml_latitude: shipmentData.receiver_address.latitude,
          ml_longitude: shipmentData.receiver_address.longitude,
          store: {
            connect: { id: store.id },
          },
          products: orderData.order_items
        },
        create: {
          ml_order_id: orderId,
          ml_tracking_id: String(shipmentData.id),
          ml_status: shipmentData.status,
          ml_substatus: shipmentData.substatus,
          ml_zip_code: shipmentData.receiver_address.zip_code,
          ml_state_name: shipmentData.receiver_address.state.name,
          ml_city_name: shipmentData.receiver_address.city.name,
          ml_street_name: shipmentData.receiver_address.street_name,
          ml_street_number: shipmentData.receiver_address.street_number,
          ml_comment: shipmentData.receiver_address.comment,
          ml_receiver_name: shipmentData.receiver_address.receiver_name,
          ml_delivery_preference: shipmentData.receiver_address.delivery_preference,
          ml_order_date: orderDate,
          voys_status: voysStatus,
          store: {
            connect: { id: store.id },
          },
          products: orderData.order_items,
          buyer_nickname: orderData.buyer.nickname, 
        },
      });

      const _package = await this.prisma.package.findFirst({
        where: { ml_tracking_id: shipmentData.id.toString() },
      });

      /*GET MERCADOLIBRE LABEL
      ========================================*/
      console.log('shipmentData.substatus-------------->', shipmentData.substatus)
      if (shipmentData.substatus === 'printed') {
        const pdfResult = await this.getAndSaveShipmentLabel(trackingId, store.id, orderId);
        console.log('pdfResult-------------->', pdfResult)
      }

      if (_package) {
        await this.packagesService.updatePackageHistory(
          _package.id,
          null,
          'MercadoLibre',
          `${shipmentData.status} ${shipmentData.substatus}`,
          `Cambio de estado de mercadolibre ${shipmentData.status} ${shipmentData.substatus}`,
        );
      }
    }
  }


  /*========================================
  GET ORDER DATA
  ========================================*/
  async getOrderData(orderId: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.mercadolibre.com/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch order data: ${error.response?.data?.message || error.message}`);
    }
  }

  /*========================================
  GET SHIPMENT DATA
  ========================================*/
  async getShipmentData(trackingId: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.mercadolibre.com/shipments/${trackingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch shipment data: ${error.response?.data?.message || error.message}`);
    }
  }

  /*========================================
  GET SHIPMENT LABEL
  ========================================*/

  async getShipmentLabelFromML(shipmentId: string, store: number): Promise<any> {
    // Get a valid token from your mlAuthService
    const tokenData = await this.mlAuthService.getValidToken(store);
  console.log(store,shipmentId, 'shipmentid and store')
    try {
        // Make the API request to fetch the shipment label (as a PDF)
        const response = await axios.get(`https://api.mercadolibre.com/shipment_labels`, {
            params: {
                shipment_ids: shipmentId,
                response_type: 'pdf',  // Requesting PDF format
            },
            headers: {
                Authorization: `Bearer ${tokenData.ml_access_token}`,
            },
            responseType: 'arraybuffer', // Specify response type as arraybuffer
        });

        // Log response for debugging
        console.log(response.data, 'this is pdf response');
        console.log(`Response data length: ${response.data.length}`);
       
        // Instead of saving to a file, return the PDF data directly
        const exportDir = path.join(process.cwd(), 'exports', 'orders');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const filename = `${shipmentId}.pdf`;
        const filePath = path.join(exportDir, filename);
        fs.writeFileSync(filePath, response.data);


        await this.prisma.package.update({
          where: { ml_tracking_id: shipmentId },
          data: {
            shipment_label: filename,
          },
        });

        const pdfData = Buffer.from(response.data, 'binary').toString('base64'); // Convert to base64

        const outputFolder = path.join(process.cwd(), 'exports', 'orders');
        await this.generateQRCode(filePath, outputFolder, shipmentId);

        return {
            status: 'success',
            data: {
                file: `data:application/pdf;base64,${pdfData}`, // Return as base64 data URL
            },
        };
    } catch (error) {
        // Better error handling in NestJS
        throw new Error(`Failed to fetch shipment label: ${error.response?.data?.message || error.message}`);
    }
  }


  async getShipmentLabel(shipmentId: string, store: number): Promise<any> {
    try {
      // Find the package in the database
      const _package = await this.prisma.package.findFirst({
        where: { ml_tracking_id: shipmentId },
      });

      if (!_package || !_package.shipment_label) {
        console.log('No label found in database, fetching from MercadoLibre');
        const result = await this.getShipmentLabelFromML(shipmentId, store);
        return result;
      }

      // Construct the file path
      const filePath = path.join(process.cwd(), 'exports', 'orders', _package.shipment_label);
      const outputFolder = path.join(process.cwd(), 'exports', 'orders');

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('Label file not found in filesystem');
      }

      // Read the file
      const fileData = fs.readFileSync(filePath);
      const pdfData = fileData.toString('base64');

      return {
        status: 'success',
        data: {
          file: `data:application/pdf;base64,${pdfData}`,
        },
      };
    } catch (error) {
      throw new Error(`Failed to retrieve shipment label: ${error.message}`);
    }
  }


  /*========================================
  GET AND SAVE SHIPMENT LABEL
  ========================================*/
  async getAndSaveShipmentLabel(shipmentId: string, store: number, orderId: string): Promise<any> {

    console.log('getAndSaveShipmentLabel ***', shipmentId, store, orderId)
    const tokenData = await this.mlAuthService.getValidToken(store);

    console.log('tokenData ***', tokenData)
    
    // Check if shipment_label already exists
    const existingPackage = await this.prisma.package.findFirst({
      where: { ml_order_id: orderId },
    });

    if (existingPackage && existingPackage.shipment_label) {
      return {
        status: 'success',
        message: 'Shipment label already exists',
      };
    }

    try {
        const exportDir = path.join(process.cwd(), 'exports', 'orders');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const response = await axios.get(`https://api.mercadolibre.com/shipment_labels`, {
            params: {
                shipment_ids: shipmentId,
                response_type: 'pdf',
            },
            headers: {
                Authorization: `Bearer ${tokenData.ml_access_token}`,
            },
            responseType: 'arraybuffer',
        });


        const filename = `${orderId}.pdf`;
        const filePath = path.join(exportDir, filename);
        fs.writeFileSync(filePath, response.data);

        const updatePrisma = await this.prisma.package.update({
            where: { ml_order_id: orderId },
            data: { 
              shipment_label: filename,
            }
        });

        // Convert to base64 for response
        const pdfData = Buffer.from(response.data, 'binary').toString('base64');

        const outputFolder = path.join(process.cwd(), 'exports', 'orders');
        await this.generateQRCode(filePath, outputFolder, shipmentId);

        
        return {
            status: 'success',
            data: {
                file: `data:application/pdf;base64,${pdfData}`,
                savedPath: filePath
            },
        };
    } catch (error) {
        throw new Error(`Failed to fetch or save shipment label: ${error.response?.data?.message || error.message}`);
    }
  }

  /*========================================
  GET SHIPMENT QR CODE
  ========================================*/
  async getShipmentQRCode(shipmentId: string, store: number): Promise<any> {
    const _package = await this.prisma.package.findUnique({
      where: { ml_tracking_id: shipmentId },
    });

    console.log(_package, 'package')
  
    if (!_package) {
      throw new NotFoundException(ErrorCodes.PACKAGE_NOT_FOUND);
    }
  
    // const today = format(new Date(), 'yyyy-MM-dd');
    // const entryDate = _package.plant_entry_date
    //   ? format(new Date(_package.plant_entry_date), 'yyyy-MM-dd')
    //   : null;  
    if (!_package.qr_data) {
      console.error(`El qr de ${shipmentId} no ha sido generado`);
      return null;
    }  
    return QRCode.toDataURL(_package.qr_data);
  }



  async generateQRCode(pdfPath, outputFolder, shipmentId) {
    const options = {
      density: 100,
      saveFilename: shipmentId,
      savePath: outputFolder,
      format: 'png',
      width: 2000,
      height: 1400,
    };

    const convert = fromPath(pdfPath, options);
    const pageToConvertAsImage = 1;

    try {
      const result = await convert(pageToConvertAsImage, {
        responseType: 'image',
      });
      console.log('Conversion result:', result);

      // Read the generated image and scan for QR code
      const image = await Jimp.read(result.path);  // This is the corrected line
      const { width, height } = image.bitmap;
      const imageData = new Uint8ClampedArray(width * height * 4);

      // Get image data
      let i = 0;
      image.scan(0, 0, width, height, function(x, y, idx) {
        imageData[i++] = this.bitmap.data[idx + 0];
        imageData[i++] = this.bitmap.data[idx + 1];
        imageData[i++] = this.bitmap.data[idx + 2];
        imageData[i++] = this.bitmap.data[idx + 3];
      });

      // Scan for QR code
      const code = jsQR.default(imageData, width, height);
      
      if (code) {
        console.log('Found QR code:', code.data);

        await this.prisma.package.update({
          where: { ml_tracking_id: shipmentId },
          data: {
            qr_data: code.data,
          },
        });


        return {
          imagePath: result.path,
          qrData: code.data
        };
      } else {
        console.log('No QR code found in the image');
        return {
          imagePath: result.path,
          qrData: null
        };
      }
    } catch (error) {
      console.error('Conversion or QR reading error:', error);
      throw error;
    }
  }

}
