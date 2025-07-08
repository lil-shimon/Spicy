import { describe, expect, it, vi } from "vitest";
import { fetchKucoin } from "./fetch-kucoin";
import { PAIRS } from "../../constants";

vi.mock("ccxt", async () => {
  const actual = await vi.importActual<typeof import("ccxt")>("ccxt");

  return {
    ...actual,
    kucoin: vi.fn().mockImplementation(() => ({
      fetchTicker: vi.fn().mockResolvedValue({
        bid: 1.2345,
        ask: 1.2346,
      }),
    })),
  };
});

describe("fetchKucoin", () => {
  it("should fetch kucoin ticker for ADA/USDT", async () => {
    const result = await fetchKucoin(PAIRS.HNT_USDT);
    expect(result).toEqual({
      bid: expect.any(Number),
      ask: expect.any(Number),
    });

    expect(result.bid).toBe(1.2345);
    expect(result.ask).toBe(1.2346);
  });

  it("should return 0 for XO/USDT pair", async () => {
    const result = await fetchKucoin(PAIRS.XO_USDT);
    expect(result).toEqual({
      bid: 0,
      ask: 0,
    });
  });
});
