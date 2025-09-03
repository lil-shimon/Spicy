import { describe, expect, it } from 'vitest';
import { calcTriangleArbitrage } from './triangle';

const defaultParams = {
  buyBtcPair: { bid: 1, ask: 1 },
  buyTokenPair: { bid: 1, ask: 1 },
  buyStablePair: { bid: 1, ask: 1 },
  takerFee: 0.001,
};

describe('calcTriangleArbitrage', () => {
  describe('ok: false', () => {
    it('should return false when buyBtcPair ask price is zero', () => {
      const params = {
        ...defaultParams,
        buyBtcPair: { bid: 1, ask: 0 },
      };
      const result = calcTriangleArbitrage(params);
      expect(result).toEqual({ ok: false });
    });

    it('should return false when buyTokenPair ask price is zero', () => {
      const params = {
        ...defaultParams,
        buyTokenPair: { bid: 1, ask: 0 },
      };
      const result = calcTriangleArbitrage(params);
      expect(result).toEqual({ ok: false });
    });

    it('should return false when buyStablePair bid price is zero', () => {
      const params = {
        ...defaultParams,
        buyStablePair: { bid: 0, ask: 1 },
      };
      const result = calcTriangleArbitrage(params);
      expect(result).toEqual({ ok: false });
    });
  });
});
