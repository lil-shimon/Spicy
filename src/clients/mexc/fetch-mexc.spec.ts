import { describe, expect, it, vi } from "vitest";
import { fetchMexc } from "./fetch-mexc";
import { PAIRS } from "../../constants";

vi.mock("ccxt", async () => {
  const actual = await vi.importActual<typeof import("ccxt")>("ccxt");

  return {
    ...actual,
    mexc: vi.fn().mockImplementation(() => ({
      fetchTicker: vi.fn().mockResolvedValue({
        bid: 1.2345,
        ask: 1.2346,
      }),
    })),
  };
});

describe("fetchMexc", () => {
  it("should fetch mexc ticker for HNT/USDT", async () => {
    const result = await fetchMexc(PAIRS.HNT_USDT);
    expect(result).toEqual({
      bid: expect.any(Number),
      ask: expect.any(Number),
    });
    expect(result.bid).toBe(1.2345);
    expect(result.ask).toBe(1.2346);
  });
});
