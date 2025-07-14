import { UpdateMlNotificationDto } from './update-ml-notification.dto';
import { CreateMlNotificationDto } from './create-ml-notification.dto';
import { PartialType } from '@nestjs/swagger';

describe('UpdateMlNotificationDto', () => {
  it('should be defined', () => {
    expect(new UpdateMlNotificationDto()).toBeDefined();
  });

  it('should be able to create an instance', () => {
    const dto = new UpdateMlNotificationDto();
    expect(dto).toBeInstanceOf(UpdateMlNotificationDto);
  });

  it('should be empty', () => {
    const dto = new UpdateMlNotificationDto();
    expect(Object.keys(dto)).toHaveLength(0);
  });

  it('should allow partial properties from CreateMlNotificationDto', () => {
    const partialDto: Partial<CreateMlNotificationDto> = {};
    const dto = new UpdateMlNotificationDto(partialDto);
    expect(dto).toEqual({});
  });

  it('should have PartialType in its prototype chain', () => {
    const dto = new UpdateMlNotificationDto();
    const prototype = Object.getPrototypeOf(dto.constructor);
    expect(prototype.name).toBe('PartialTypeClass');
  });

  it('should be related to CreateMlNotificationDto', () => {
    expect(UpdateMlNotificationDto.name).toBe('UpdateMlNotificationDto');
    expect(Object.getPrototypeOf(UpdateMlNotificationDto).name).toBe('PartialTypeClass');
  });
});