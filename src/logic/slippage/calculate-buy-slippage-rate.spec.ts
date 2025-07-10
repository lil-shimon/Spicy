// CCに生成してもらったので一度自分で実装したい

import { describe, it, expect } from "vitest";
import { calculateBuySlippageRate } from "./calculate-buy-slippate-rate";
import { OrderBookEntry } from "./calculate-buy-slippage-rate.types";

describe("calculateBuySlippageRate", () => {
  describe("正常系", () => {
    it("単一オーダーで取引量が満たされる場合", () => {
      const asks: OrderBookEntry[] = [[100, 10]];
      const tradeAmount = 5;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBe(0);
    });

    it("複数オーダーにまたがる場合のスリッページ計算", () => {
      const asks: OrderBookEntry[] = [
        [100, 5],
        [101, 5],
        [102, 5],
      ];
      const tradeAmount = 10;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeCloseTo(0.4975, 3);
    });

    it("最後のオーダーが部分的に消費される場合", () => {
      const asks: OrderBookEntry[] = [
        [100, 3],
        [101, 10],
      ];
      const tradeAmount = 5;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeCloseTo(37.888, 3);
    });

    it("大きなオーダーブックでの計算", () => {
      const asks: OrderBookEntry[] = [
        [100, 10],
        [101, 15],
        [102, 20],
        [103, 25],
      ];
      const tradeAmount = 30;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeCloseTo(34.138, 3);
    });
  });

  describe("異常系", () => {
    it("取引量がオーダーブックの総量を超える場合", () => {
      const asks: OrderBookEntry[] = [
        [100, 3],
        [101, 2],
      ];
      const tradeAmount = 10;
      expect(() => calculateBuySlippageRate(asks, tradeAmount)).toThrow(
        "注文量に対して板が薄すぎます"
      );
    });

    it("オーダーブックが空の場合", () => {
      const asks: OrderBookEntry[] = [];
      const tradeAmount = 5;
      expect(() => calculateBuySlippageRate(asks, tradeAmount)).toThrow(
        "注文量に対して板が薄すぎます"
      );
    });

    it("取引量が0の場合", () => {
      const asks: OrderBookEntry[] = [[100, 10]];
      const tradeAmount = 0;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeNaN();
    });
  });

  describe("エッジケース", () => {
    it("価格が0のオーダーが含まれる場合", () => {
      const asks: OrderBookEntry[] = [
        [0, 5],
        [100, 5],
      ];
      const tradeAmount = 3;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });

    it("数量が0のオーダーが含まれる場合", () => {
      const asks: OrderBookEntry[] = [
        [100, 0],
        [101, 5],
      ];
      const tradeAmount = 3;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });

    it("取引量がオーダーブックの総量と完全に一致する場合", () => {
      const asks: OrderBookEntry[] = [
        [100, 5],
        [101, 5],
      ];
      const tradeAmount = 10;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeCloseTo(0.4975, 3);
    });

    it("非常に小さなスリッページのケース", () => {
      const asks: OrderBookEntry[] = [
        [100, 99],
        [100.01, 1],
      ];
      const tradeAmount = 100;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeCloseTo(0.0001, 4);
    });

    it("小数点を含む価格と数量のテスト", () => {
      const asks: OrderBookEntry[] = [
        [99.99, 2.5],
        [100.01, 3.5],
        [100.05, 4.0],
      ];
      const tradeAmount = 6;
      const result = calculateBuySlippageRate(asks, tradeAmount);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
