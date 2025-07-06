import { describe, it, expect } from "vitest";
import { calculateProfitRate } from "./profit-rate";

describe("profit-rate", () => {
  it("should return the correct profit rate", () => {
    const result = calculateProfitRate(10, 100);
    expect(result).toBe(10);
  });
});
