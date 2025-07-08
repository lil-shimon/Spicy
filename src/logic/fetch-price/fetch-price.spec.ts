import { describe, vi, it, expect } from "vitest";
import { fetchPrices } from "./fetch-price";

// import * as clientModule from "../../clients";
import * as coreModule from "../../core";
import * as fetchPriceModule from "../fetch-price-by-pair/fetch-price-by-pair";
import { PAIRS } from "../../constants";

describe("fetchPrices", () => {
  it("should return profit rate", async () => {
    vi.spyOn(fetchPriceModule, "fetchPriceByPair").mockResolvedValue({
      binance: { bid: 1, ask: 2 },
      bybit: { bid: 1.5, ask: 2.5 },
      mexc: { bid: 1.5, ask: 2.5 },
      kucoin: { bid: 1.5, ask: 2.5 },
    });

    vi.spyOn(coreModule, "calculateSpread").mockReturnValue(0.5);
    vi.spyOn(coreModule, "calculateProfitRate").mockReturnValue(0.5);

    const result = await fetchPrices();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pair: PAIRS.HNT_USDT,
          from: "mexc",
          to: "bybit",
          profit: 0.5,
        }),
      ])
    );
  });

  it("should return empty array when no profit", async () => {
    vi.spyOn(fetchPriceModule, "fetchPriceByPair").mockResolvedValue({
      binance: { bid: 1, ask: 2 },
      bybit: { bid: 1.5, ask: 2.5 },
      mexc: { bid: 1.5, ask: 2.5 },
      kucoin: { bid: 1.5, ask: 2.5 },
    });

    vi.spyOn(coreModule, "calculateSpread").mockReturnValue(0);
    vi.spyOn(coreModule, "calculateProfitRate").mockReturnValue(0);

    const result = await fetchPrices();
    expect(result).toEqual([]);
  });
});
