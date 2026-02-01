import { describe, expect, it } from 'vitest';
import { createL2Topic } from './topic';

describe('topic', () => {
  it('トピックを正しく返すこと', () => {
    const pair = 'BTC-USDT';
    const expectedTopic = `/market/level2:${pair}`;

    const result = createL2Topic(pair);
    expect(result).toBe(expectedTopic);
  });
});
