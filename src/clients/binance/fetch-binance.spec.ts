import { describe, expect, it, vi } from "vitest";
import { fetchBinance } from "./fetch-binance";

vi.mock("ccxt", async () => {
  const actual = await vi.importActual<typeof import("ccxt")>("ccxt");

  return {
    ...actual,
    binance: vi.fn().mockImplementation(() => ({
      fetchTicker: vi.fn().mockResolvedValue({
        bid: 1.2345,
        ask: 1.2346,
      }),
    })),
  };
});

describe("fetchBinance", () => {
  it("should fetch Binance ticker for ADA/USDT", async () => {
    const result = await fetchBinance();
    expect(result).toEqual({
      bid: expect.any(Number),
      ask: expect.any(Number),
    });
    expect(result.bid).toBe(1.2345);
    expect(result.ask).toBe(1.2346);
  });
});
