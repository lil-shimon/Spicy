import { describe, expect, it } from 'vitest';
import { generatePairs } from './pairs';

describe('pairs', () => {
  describe('generatePairs', () => {
    it('should generate correct pairs', () => {
      const tokens = ['BTC', 'USDT', 'DOGE'];
      const pairs = [
        'BTC-USDT',
        'BTC-DOGE',
        'USDT-BTC',
        'USDT-DOGE',
        'DOGE-BTC',
        'DOGE-USDT',
      ];
      const result = generatePairs(tokens);
      expect(result).toEqual(pairs);
    });
  });
});
