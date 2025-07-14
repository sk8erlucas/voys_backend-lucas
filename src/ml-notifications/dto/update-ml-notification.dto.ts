import { PartialType } from '@nestjs/swagger';
import { CreateMlNotificationDto } from './create-ml-notification.dto';

export class UpdateMlNotificationDto extends PartialType(CreateMlNotificationDto) {}
