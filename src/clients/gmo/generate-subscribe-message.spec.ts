import { describe, expect, it } from 'vitest';
import { generateSubscribeMessage } from './generate-subscribe-message';

describe('generateSubscribeMessage', () => {
  it('should return subscribeMessage', () => {
    const result = generateSubscribeMessage({
      channel: 'ticker',
      symbol: 'BTC',
    });

    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      command: 'subscribe',
      channel: 'ticker',
      symbol: 'BTC',
    });
  });
});
