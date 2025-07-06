import { describe, expect, it, vi } from "vitest";
import { fetchBybit } from "./fetch-bybit";
import { PAIRS } from "../../constants";

vi.mock("ccxt", async () => {
  const actual = await vi.importActual<typeof import("ccxt")>("ccxt");

  return {
    ...actual,
    bybit: vi.fn().mockImplementation(() => ({
      fetchTicker: vi.fn().mockResolvedValue({
        bid: 1.2345,
        ask: 1.2346,
      }),
    })),
  };
});

describe("fetchBybit", () => {
  it("should fetch Bybit ticker for ADA/USDT", async () => {
    const result = await fetchBybit(PAIRS.ADA_USDT);
    expect(result).toEqual({
      bid: expect.any(Number),
      ask: expect.any(Number),
    });

    expect(result.bid).toBe(1.2345);
    expect(result.ask).toBe(1.2346);
  });
});
