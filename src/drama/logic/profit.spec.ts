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
});
