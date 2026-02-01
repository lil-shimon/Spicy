import { describe, it, vi, expect } from 'vitest';
import * as token from './token';
import { getSpotEndpoint } from './endpoint';

describe('endpoint', () => {
  it('WebSocketのendpointを正しくreturnすること', async () => {
    const mockToken = 'mocked-token';

    vi.spyOn(token, 'getSpotToken').mockResolvedValueOnce(mockToken);

    const endpoint = await getSpotEndpoint();
    expect(endpoint).toBe(`wss://ws-api-spot.kucoin.com?token=${mockToken}`);
  });
});
