import { describe, vi, it, expect } from "vitest";
import { fetchPrices } from "./fetchPrice";

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

  it("should return spreads", async () => {
    const result = await fetchPrices();
    expect(result).toBe(0.5);
  });
});
