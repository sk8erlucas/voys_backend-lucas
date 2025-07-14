import { Messages } from './messages.enum';

describe('Messages Enum', () => {
  it('should have STORE_VINCULATED message', () => {
    expect(Messages.STORE_VINCULATED).toBeDefined();
    expect(Messages.STORE_VINCULATED).toBe('STORE_VINCULATED');
  });

  it('should have STORE_VINCULATION_FAILED message', () => {
    expect(Messages.STORE_VINCULATION_FAILED).toBeDefined();
    expect(Messages.STORE_VINCULATION_FAILED).toBe('STORE_VINCULATION_FAILED');
  });

  it('should have ALREADY_VINCULATED_STORE message', () => {
    expect(Messages.ALREADY_VINCULATED_STORE).toBeDefined();
    expect(Messages.ALREADY_VINCULATED_STORE).toBe('ALREADY_VINCULATED_STORE');
  });

  it('should have the correct number of messages', () => {
    const messageCount = Object.keys(Messages).length;
    expect(messageCount).toBe(3);
  });

  it('should not have any additional messages', () => {
    const expectedMessages = [
      'STORE_VINCULATED',
      'STORE_VINCULATION_FAILED',
      'ALREADY_VINCULATED_STORE'
    ];

    for (const key in Messages) {
      expect(expectedMessages).toContain(Messages[key as keyof typeof Messages]);
    }
  });
});
