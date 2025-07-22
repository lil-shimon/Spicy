import { fetchPriceByPair } from './fetch-price-by-pair';
import { describe, vi, it, expect } from 'vitest';

import * as clientModule from '../../clients';
import { PAIRS } from '../../constants';

describe('fetchPrices', () => {
  vi.spyOn(clientModule, 'fetchBybit').mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });
  vi.spyOn(clientModule, 'fetchMexc').mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });
  vi.spyOn(clientModule, 'fetchBinance').mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });
  vi.spyOn(clientModule, 'fetchKucoin').mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });

  it('should return prices', async () => {
    const result = await fetchPriceByPair(PAIRS.SOL_USDT);
    expect(result).toEqual({
      bybit: { bid: 1.5, ask: 2.5 },
      mexc: { bid: 1.5, ask: 2.5 },
      binance: { bid: 1.5, ask: 2.5 },
      kucoin: { bid: 1.5, ask: 2.5 },
    });
  });

  it('should return prices with correct types', async () => {
    const result = await fetchPriceByPair(PAIRS.SOL_USDT);
    expect(result).toEqual({
      bybit: { bid: expect.any(Number), ask: expect.any(Number) },
      mexc: { bid: expect.any(Number), ask: expect.any(Number) },
      binance: { bid: expect.any(Number), ask: expect.any(Number) },
      kucoin: { bid: expect.any(Number), ask: expect.any(Number) },
    });
  });
});
