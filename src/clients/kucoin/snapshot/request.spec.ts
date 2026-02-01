import { describe, it, vi, expect, beforeEach } from 'vitest';
import { fetchSnapshot } from './request';

describe('request', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('取得されたデータが正しいこと', async () => {
    const data = {
      code: '200000',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data,
      }),
    } as Response);

    const result = await fetchSnapshot({ pair: 'BTC-USDT' });
    expect(result).toEqual(
      expect.objectContaining({
        data: data,
      })
    );
  });

  it('fetchが正しいURLとオプションで呼び出されること', async () => {
    const data = {
      code: '200000',
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data,
      }),
    } as Response);

    await fetchSnapshot({ pair: 'BTC-USDT' });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=BTC-USDT',
      {
        method: 'GET',
        redirect: 'follow',
      }
    );
  });

  it('fetchが失敗した場合、エラーがスローされること', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchSnapshot({ pair: 'BTC-USDT' })).rejects.toThrow(
      'Failed to fetch Kucoin snapshot: Error: Network error'
    );
  });
});
