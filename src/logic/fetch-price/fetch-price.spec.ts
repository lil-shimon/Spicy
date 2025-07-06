import { describe, vi, it, expect } from "vitest";
import { fetchPrices } from "./fetch-price";

import * as clientModule from "../../clients";
import * as coreModule from "../../core";

describe("fetchPrices", () => {
  vi.spyOn(clientModule, "fetchBinance").mockResolvedValue({
    bid: 1,
    ask: 2,
  });
  vi.spyOn(clientModule, "fetchBybit").mockResolvedValue({
    bid: 1.5,
    ask: 2.5,
  });
  vi.spyOn(coreModule, "calculateSpread").mockReturnValue(0.5);
  vi.spyOn(coreModule, "calculateProfitRate").mockReturnValue(0.5);

  it("should return profit rate", async () => {
    const result = await fetchPrices();
    expect(result).toBe(0.5);
  });
});
