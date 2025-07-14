import { describe, it, expect } from 'vitest';
import { checkArbitrageOpportunities } from './check-arbitrage-opportunities';
import { EXCHANGES, PAIRS } from '../../constants';

describe('checkArbitrageOpportunities', () => {
  const mockProfit = [
    {
      pair: PAIRS.SOL_USDT,
      from: EXCHANGES.BYBIT,
      to: EXCHANGES.MEXC,
      profit: 0.51,
    },
  ];

  it('should return arbitrage opportunities above threshold', () => {
    const result = checkArbitrageOpportunities(mockProfit);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockProfit[0]);
  });

  it('should return empty array when profit is below threshold', () => {
    const profit = [
      {
        ...mockProfit[0],
        profit: 0.49, // Below the threshold of 0.5
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toEqual([]);
  });

  it('should return empty array when profit is zero', () => {
    const profit = [
      {
        ...mockProfit[0],
        profit: 0,
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toEqual([]);
  });

  it('should return empty array when profit is exactly 0.5', () => {
    const profit = [
      {
        ...mockProfit[0],
        profit: 0.5,
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toEqual([]);
  });

  it('should filter and return only opportunities above threshold', () => {
    const profit = [
      {
        pair: PAIRS.SOL_USDT,
        from: EXCHANGES.BYBIT,
        to: EXCHANGES.MEXC,
        profit: 0.51,
      },
      {
        pair: PAIRS.XO_USDT,
        from: EXCHANGES.MEXC,
        to: EXCHANGES.BYBIT,
        profit: 0.3,
      },
      {
        pair: PAIRS.SOL_USDT,
        from: EXCHANGES.BYBIT,
        to: EXCHANGES.MEXC,
        profit: 0.7,
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toHaveLength(2);
    expect(result[0].profit).toBe(0.51);
    expect(result[1].profit).toBe(0.7);
  });
});
