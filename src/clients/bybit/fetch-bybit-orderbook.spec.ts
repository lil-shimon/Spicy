import { describe, it, expect, vi } from "vitest";
import { fetchBybitOrderbook } from "./fetch-bybit-orderbook";
import { PAIRS } from "../../constants";

describe("fetchBybitOrderbook", () => {
  vi.mock("ccxt", async () => {
    const actual = await vi.importActual<typeof import("ccxt")>("ccxt");

    return {
      ...actual,
      bybit: vi.fn().mockImplementation(() => ({
        fetchOrderBook: vi.fn().mockResolvedValue({
          bids: [[1.2345, 100]],
          asks: [[1.2346, 100]],
        }),
      })),
    };
  });

  it("should fetch Bybit orderbook for a given pair", async () => {
    const pair = PAIRS.HNT_USDT;
    const orderbook = await fetchBybitOrderbook(pair);

    expect(orderbook).toBeDefined();
    expect(orderbook.bids).toBeDefined();
    expect(orderbook.asks).toBeDefined();
    expect(orderbook.bids).toEqual([[1.2345, 100]]);
    expect(orderbook.asks).toEqual([[1.2346, 100]]);
  });

  it.todo("should handle errors");

  it.todo("should return empty arrays for bids and asks");
});