import { fetchPriceByPair } from "./fetch-price-by-pair";
import { describe, vi, it, expect } from "vitest";

import * as clientModule from "../../clients";
import { PAIRS } from "../../constants";

describe("fetchPrices", () => {
  vi.spyOn(clientModule, "fetchBinance").mockResolvedValue({
    bid: 1,
    ask: 2,
  });
  vi.spyOn(clientModule, "fetchBybit").mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });
  vi.spyOn(clientModule, "fetchMexc").mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });
  vi.spyOn(clientModule, "fetchKucoin").mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });

  it("should return prices", async () => {
    const result = await fetchPriceByPair(PAIRS.ADA_USDC);
    expect(result).toEqual({
      binance: { bid: 1, ask: 2 },
      bybit: { bid: 1.5, ask: 2.5 },
      mexc: { bid: 1.5, ask: 2.5 },
      kucoin: { bid: 1.5, ask: 2.5 },
    });
  });

  it("should return prices with correct types", async () => {
    const result = await fetchPriceByPair(PAIRS.ADA_USDC);
    expect(result).toEqual({
      binance: { bid: expect.any(Number), ask: expect.any(Number) },
      bybit: { bid: expect.any(Number), ask: expect.any(Number) },
      mexc: { bid: expect.any(Number), ask: expect.any(Number) },
      kucoin: { bid: expect.any(Number), ask: expect.any(Number) },
    });
  });
});
