import { describe, it, expect } from 'vitest';
import { calculateMarketMakerProfit } from './market-maker-profit';

describe('calculateMarketMakerProfit', () => {
  it('should calculate profitable scenario with default parameters', () => {
    // bestBid: 100, bestAsk: 100.1
    // spread: 0.1%
    // roundTripFee: 0.04% (0.02% * 2)
    // netProfit: 0.06%
    const result = calculateMarketMakerProfit(100, 100.1);

    expect(result.spreadRate).toBeCloseTo(0.1, 2);
    expect(result.roundTripFee).toBe(0.04);
    expect(result.netProfit).toBeCloseTo(0.06, 2);
    expect(result.isProfitable).toBe(true);
  });

  it('should calculate unprofitable scenario when spread is too small', () => {
    // bestBid: 100, bestAsk: 100.03
    // spread: 0.03%
    // roundTripFee: 0.04%
    // netProfit: -0.01%
    const result = calculateMarketMakerProfit(100, 100.03);

    expect(result.spreadRate).toBeCloseTo(0.03, 2);
    expect(result.roundTripFee).toBe(0.04);
    expect(result.netProfit).toBeCloseTo(-0.01, 2);
    expect(result.isProfitable).toBe(false);
  });

  it('should calculate with custom maker fee', () => {
    // Custom maker fee: 0.05%
    // roundTripFee: 0.1%
    const result = calculateMarketMakerProfit(100, 100.2, 0.05);

    expect(result.spreadRate).toBeCloseTo(0.2, 2);
    expect(result.roundTripFee).toBe(0.1);
    expect(result.netProfit).toBeCloseTo(0.1, 2);
    expect(result.isProfitable).toBe(true);
  });

  it('should calculate with custom profit threshold', () => {
    // netProfit: 0.06% (spread 0.1% - fee 0.04%)
    // Custom threshold: 0.07%
    const result = calculateMarketMakerProfit(100, 100.1, 0.02, 0.07);

    expect(result.netProfit).toBeCloseTo(0.06, 2);
    expect(result.isProfitable).toBe(false); // 0.06% < 0.07% threshold
  });

  it('should handle large spread correctly', () => {
    // bestBid: 100, bestAsk: 101
    // spread: 1%
    const result = calculateMarketMakerProfit(100, 101);

    expect(result.spreadRate).toBeCloseTo(1, 2);
    expect(result.roundTripFee).toBe(0.04);
    expect(result.netProfit).toBeCloseTo(0.96, 2);
    expect(result.isProfitable).toBe(true);
  });

  it('should handle edge case where spread equals fees', () => {
    // spread exactly equals roundtrip fee
    const result = calculateMarketMakerProfit(100, 100.04);

    expect(result.spreadRate).toBeCloseTo(0.04, 2);
    expect(result.roundTripFee).toBe(0.04);
    expect(result.netProfit).toBeCloseTo(0, 2);
    expect(result.isProfitable).toBe(false); // 0% is not > 0.01% threshold
  });

  it('should handle zero maker fee', () => {
    // Special promotion: 0% maker fee
    const result = calculateMarketMakerProfit(100, 100.05, 0);

    expect(result.spreadRate).toBeCloseTo(0.05, 2);
    expect(result.roundTripFee).toBe(0);
    expect(result.netProfit).toBeCloseTo(0.05, 2);
    expect(result.isProfitable).toBe(true);
  });
});
