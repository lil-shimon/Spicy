import { describe, it, expect } from 'vitest';
import { checkArbitrageOpportunities } from './check-arbitrage-opportunities';
import { EXCHANGES, PAIRS } from '../../constants';

describe('checkArbitrageOpportunities', () => {
  const mockProfit = [
    {
      pair: PAIRS.HNT_USDT,
      from: EXCHANGES.BYBIT,
      to: EXCHANGES.MEXC,
      profit: 0.51,
    },
  ];

  it('should check for arbitrage opportunities', () => {
    const result = checkArbitrageOpportunities(mockProfit);
    expect(result).toBe(true);
  });

  it('should not find arbitrage opportunities when profit is below threshold', () => {
    const profit = [
      {
        ...mockProfit[0],
        profit: 0.49, // Below the threshold of 0.5
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toBe(false);
  });

  it('should not find arbitrage opportunities when profit is zero', () => {
    const profit = [
      {
        ...mockProfit[0],
        profit: 0,
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toBe(false);
  });

  it('should not find arbitrage opportunities when profit is 0.5', () => {
    const profit = [
      {
        ...mockProfit[0],
        profit: 0.5,
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toBe(false);
  });
});
