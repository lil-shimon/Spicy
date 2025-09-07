import { describe, expect, it } from 'vitest';
import { calcTriangleArbitrage, Result } from './calc-triangle-arbitrage';

const defaultParams = {
  buyBtcPair: { bid: 1, ask: 1 },
  buyTokenPair: { bid: 1, ask: 1 },
  buyStablePair: { bid: 1, ask: 1 },
  takerFee: 0.001,
};

describe('calcTriangleArbitrage', () => {
  describe('taker fee', () => {
    it('should return taker fee', () => {
      const result = calcTriangleArbitrage({ ...defaultParams, takerFee: 0.1 });
      expect(result.detail.takerFee).toEqual(0.1);
    });
  });
  describe('ok: false', () => {
    const falseExpect: Result = {
      ok: false,
      roi: -1,
      usdtOut: 0,
      usdtIn: 1,
      detail: {
        baseAsk: 1,
        midAsk: 1,
        outBid: 1,
        epsilon: 0.001,
        takerFee: 0.001,
      },
    };

    describe('price is zero', () => {
      it('should return false when buyBtcPair ask price is zero', () => {
        const params = {
          ...defaultParams,
          buyBtcPair: { bid: 1, ask: 0 },
        };
        const result = calcTriangleArbitrage(params);
        expect(result).toEqual({
          ...falseExpect,
          detail: { ...falseExpect.detail, baseAsk: 0 },
        });
      });

      it('should return false when buyTokenPair ask price is zero', () => {
        const params = {
          ...defaultParams,
          buyTokenPair: { bid: 1, ask: 0 },
        };
        const result = calcTriangleArbitrage(params);
        expect(result).toEqual({
          ...falseExpect,
          detail: { ...falseExpect.detail, midAsk: 0 },
        });
      });

      it('should return false when buyStablePair bid price is zero', () => {
        const params = {
          ...defaultParams,
          buyStablePair: { bid: 0, ask: 1 },
        };
        const result = calcTriangleArbitrage(params);
        expect(result).toEqual({
          ...falseExpect,
          detail: { ...falseExpect.detail, outBid: 0 },
        });
      });
    });

    describe('price is negative', () => {
      it('should return false when buyBtcPair ask is negative', () => {
        const params = {
          ...defaultParams,
          buyBtcPair: { bid: 1, ask: -1 },
        };

        const result = calcTriangleArbitrage(params);
        expect(result).toEqual({
          ...falseExpect,
          detail: { ...falseExpect.detail, baseAsk: -1 },
        });
      });

      it('should return false when buyTokenPair ask is negative', () => {
        const params = {
          ...defaultParams,
          buyTokenPair: { bid: 1, ask: -1 },
        };

        const result = calcTriangleArbitrage(params);
        expect(result).toEqual({
          ...falseExpect,
          detail: { ...falseExpect.detail, midAsk: -1 },
        });
      });

      it('should return false when buyStablePair bid is negative', () => {
        const params = {
          ...defaultParams,
          buyStablePair: { bid: -1, ask: 1 },
        };

        const result = calcTriangleArbitrage(params);
        expect(result).toEqual({
          ...falseExpect,
          detail: { ...falseExpect.detail, outBid: -1 },
        });
      });
    });
  });

  describe('ok: true', () => {
    const okParams = {
      ...defaultParams,
      buyTokenPair: { bid: 1, ask: 2 },
      buyStablePair: { bid: 3, ask: 1 },
    };

    it('should return ok is true', () => {
      const result = calcTriangleArbitrage(okParams);
      expect(result).toEqual(expect.objectContaining({ ok: true }));
    });
  });
});
