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
});
