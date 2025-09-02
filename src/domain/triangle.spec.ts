import { describe, expect, it } from 'vitest';
import { calcTriangleArbitrage } from './triangle';

describe('calcTriangleArbitrage', () => {
  it('should return false when buyBtcPair ask price is zero', () => {
    const result = calcTriangleArbitrage({
      buyBtcPair: { bid: 1, ask: 0 },
      buyTokenPair: { bid: 1, ask: 1 },
      buyStablePair: { bid: 1, ask: 1 },
      takerFee: 0.001,
    });
    expect(result).toEqual({ ok: false });
  });
});
