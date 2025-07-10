import { describe, it, expect } from 'vitest';
import { calculateSellSlippageRate } from './calculate-sell-slippage-rate';
import { OrderBookEntry } from './calculate-buy-slippage-rate.types';

describe('calculateSellSlippageRate', () => {
  describe('正常系', () => {
    it('単一オーダーで売却量が満たされる場合', () => {
      const bids: OrderBookEntry[] = [[100, 10]];
      const targetAmount = 5;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBe(0);
    });

    it('複数オーダーにまたがる場合のスリッページ計算', () => {
      const bids: OrderBookEntry[] = [
        [100, 5],
        [99, 5],
        [98, 5]
      ];
      const targetAmount = 10;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeCloseTo(-0.503, 3);
    });

    it('最後のオーダーが部分的に消費される場合', () => {
      const bids: OrderBookEntry[] = [
        [100, 3],
        [99, 10]
      ];
      const targetAmount = 5;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeCloseTo(37.107, 3);
    });

    it('大きなオーダーブックでの計算', () => {
      const bids: OrderBookEntry[] = [
        [103, 10],
        [102, 15],
        [101, 20],
        [100, 25]
      ];
      const targetAmount = 30;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeCloseTo(32.533, 3);
    });
  });

  describe('異常系', () => {
    it('売却量がオーダーブックの総量を超える場合', () => {
      const bids: OrderBookEntry[] = [
        [100, 3],
        [99, 2]
      ];
      const targetAmount = 10;
      expect(() => calculateSellSlippageRate(bids, targetAmount))
        .toThrow('注文量に対して板が薄すぎます');
    });

    it('オーダーブックが空の場合', () => {
      const bids: OrderBookEntry[] = [];
      const targetAmount = 5;
      expect(() => calculateSellSlippageRate(bids, targetAmount))
        .toThrow('注文量に対して板が薄すぎます');
    });

    it('売却量が0の場合', () => {
      const bids: OrderBookEntry[] = [[100, 10]];
      const targetAmount = 0;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeNaN();
    });
  });

  describe('エッジケース', () => {
    it('価格が0のオーダーが含まれる場合', () => {
      const bids: OrderBookEntry[] = [[0, 5], [100, 5]];
      const targetAmount = 3;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
    });

    it('数量が0のオーダーが含まれる場合', () => {
      const bids: OrderBookEntry[] = [[100, 0], [99, 5]];
      const targetAmount = 3;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
    });

    it('売却量がオーダーブックの総量と完全に一致する場合', () => {
      const bids: OrderBookEntry[] = [
        [100, 5],
        [99, 5]
      ];
      const targetAmount = 10;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeCloseTo(-0.503, 3);
    });

    it('非常に小さなスリッページのケース', () => {
      const bids: OrderBookEntry[] = [
        [100, 99],
        [99.99, 1]
      ];
      const targetAmount = 100;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeCloseTo(-0.0001, 4);
    });

    it('小数点を含む価格と数量のテスト', () => {
      const bids: OrderBookEntry[] = [
        [100.01, 2.5],
        [99.99, 3.5],
        [99.95, 4.0]
      ];
      const targetAmount = 6;
      const result = calculateSellSlippageRate(bids, targetAmount);
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
      expect(result).toBeLessThanOrEqual(0);
    });
  });
});