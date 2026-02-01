import { describe, expect, it, vi } from 'vitest';
import { getSpotToken } from './token';
import { beforeEach } from 'node:test';

describe('token', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('トークンを正常に取得できること', async () => {
    const mockToken = 'mocked-token';

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: {
          token: mockToken,
        },
      }),
    } as Response);

    const token = await getSpotToken();

    expect(token).toBe(mockToken);
  });

  it('トークン取得時のURLとメソッドが正しいこと', async () => {
    const mockToken = 'mocked-token';

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: {
          token: mockToken,
        },
      }),
    } as Response);

    await getSpotToken();

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.kucoin.com/api/v1/bullet-public',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('トークン取得に失敗した場合、エラーがスローされること', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    await expect(getSpotToken()).rejects.toThrow(
      'Failed to fetch Kucoin spot token: Error: Network error'
    );
  });
});
