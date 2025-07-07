import { describe, vi, it, expect } from "vitest";
import { fetchPrices } from "./fetch-price";

// import * as clientModule from "../../clients";
import * as coreModule from "../../core";
import * as fetchPriceModule from "../fetch-price-by-pair/fetch-price-by-pair";

describe("fetchPrices", () => {
  vi.spyOn(fetchPriceModule, "fetchPriceByPair").mockResolvedValue({
    binance: { bid: 1, ask: 2 },
    bybit: { bid: 1.5, ask: 2.5 },
    mexc: { bid: 1.5, ask: 2.5 },
    kucoin: { bid: 1.5, ask: 2.5 },
  });

  vi.spyOn(coreModule, "calculateSpread").mockReturnValue(0.5);
  vi.spyOn(coreModule, "calculateProfitRate").mockReturnValue(0.5);

  it("should return profit rate", async () => {
    const result = await fetchPrices();
    expect(result).toBe(0.5);
  });
});
