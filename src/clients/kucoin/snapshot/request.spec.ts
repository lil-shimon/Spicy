import { describe, it, vi, expect } from 'vitest';
import { fetchSnapshot } from './request';

describe('request', () => {
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
});
