import { describe, it, expect, vi } from 'vitest';
import { fetchMexcOrderbook } from './fetch-mexc-orderbook';
import { PAIRS } from '../../constants';

describe('fetchMexcOrderbook', () => {
  vi.mock('ccxt', async () => {
    const actual = await vi.importActual<typeof import('ccxt')>('ccxt');

    return {
      ...actual,
      mexc: vi.fn().mockImplementation(() => ({
        fetchOrderBook: vi.fn().mockResolvedValue({
          bids: [1.2345],
          asks: [1.2346],
        }),
      })),
    };
  });

  it('should fetch MEXC orderbook for a given pair', async () => {
    const pair = PAIRS.HNT_USDT;
    const orderbook = await fetchMexcOrderbook(pair);

    expect(orderbook).toBeDefined();
    expect(orderbook.bids).toBeDefined();
    expect(orderbook.asks).toBeDefined();
    expect(orderbook.bids).toEqual([1.2345]);
    expect(orderbook.asks).toEqual([1.2346]);
  });

  it.todo('should handle errors');

  it.todo('should return empty arrays for bids and asks');
});
