import { describe, it, expect } from "vitest";
import { checkArbitrageOpportunities } from "./check-arbitrage-opportunities";
import { EXCHANGES, PAIRS } from "../../constants";

describe("checkArbitrageOpportunities", () => {
  it("should check for arbitrage opportunities", () => {
    const profit = [
      {
        pair: PAIRS.HNT_USDT,
        from: EXCHANGES.BYBIT,
        to: EXCHANGES.MEXC,
        profit: 0.51,
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toBe(true);
  });

  it("should not find arbitrage opportunities when profit is below threshold", () => {
    const profit = [
      {
        pair: PAIRS.HNT_USDT,
        from: EXCHANGES.BYBIT,
        to: EXCHANGES.MEXC,
        profit: 0.01,
      },
    ];
    const result = checkArbitrageOpportunities(profit);
    expect(result).toBe(false);
  });
});
