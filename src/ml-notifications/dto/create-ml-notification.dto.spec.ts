import { CreateMlNotificationDto } from './create-ml-notification.dto';

describe('CreateMlNotificationDto', () => {
  it('should be defined', () => {
    expect(new CreateMlNotificationDto()).toBeDefined();
  });

  it('should be able to create an instance', () => {
    const dto = new CreateMlNotificationDto();
    expect(dto).toBeInstanceOf(CreateMlNotificationDto);
  });

  it('should be empty', () => {
    const dto = new CreateMlNotificationDto();
    expect(Object.keys(dto)).toHaveLength(0);
  });
});