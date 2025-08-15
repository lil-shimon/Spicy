import { describe, expect, it } from 'vitest';
import { hasProfit } from './profit';

describe('hasProfit', () => {
  it('should return true when profit is possible', () => {
    const result = hasProfit(0.1, 100, 200, 1);
    expect(result).toBe(true);
  });

  it('should return false when profit is not possible', () => {
    const result = hasProfit(0.1, 100, 110, 1);
    expect(result).toBe(false);
  });

  describe('validation errors', () => {
    it('should throw error when feeRate is negative', () => {
      expect(() => hasProfit(-0.1, 100, 200, 1)).toThrow(
        'All parameters must be positive numbers'
      );
    });

    it('should throw error when bestBid is zero', () => {
      expect(() => hasProfit(0.1, 0, 200, 1)).toThrow(
        'All parameters must be positive numbers'
      );
    });

    it('should throw error when bestBid is negative', () => {
      expect(() => hasProfit(0.1, -100, 200, 1)).toThrow(
        'All parameters must be positive numbers'
      );
    });

    it('should throw error when bestAsk is zero', () => {
      expect(() => hasProfit(0.1, 100, 0, 1)).toThrow(
        'All parameters must be positive numbers'
      );
    });

    it('should throw error when bestAsk is negative', () => {
      expect(() => hasProfit(0.1, 100, -200, 1)).toThrow(
        'All parameters must be positive numbers'
      );
    });

    it('should throw error when tickSize is zero', () => {
      expect(() => hasProfit(0.1, 100, 200, 0)).toThrow(
        'All parameters must be positive numbers'
      );
    });

    it('should throw error when tickSize is negative', () => {
      expect(() => hasProfit(0.1, 100, 200, -1)).toThrow(
        'All parameters must be positive numbers'
      );
    });

    it('should throw error when feeRate is NaN', () => {
      expect(() => hasProfit(NaN, 100, 200, 1)).toThrow(
        'Input parameters must be valid numbers'
      );
    });

    it('should throw error when bestBid is NaN', () => {
      expect(() => hasProfit(0.1, NaN, 200, 1)).toThrow(
        'Input parameters must be valid numbers'
      );
    });

    it('should throw error when bestAsk is NaN', () => {
      expect(() => hasProfit(0.1, 100, NaN, 1)).toThrow(
        'Input parameters must be valid numbers'
      );
    });

    it('should throw error when tickSize is NaN', () => {
      expect(() => hasProfit(0.1, 100, 200, NaN)).toThrow(
        'Input parameters must be valid numbers'
      );
    });
  });
});
