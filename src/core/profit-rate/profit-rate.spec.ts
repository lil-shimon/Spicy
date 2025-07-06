import { describe, it, expect } from "vitest";
import { calculateProfitRate } from "./profit-rate";

describe("profit-rate", () => {
  it("should return the correct profit rate", () => {
    const result = calculateProfitRate(10, 100);
    expect(result).toBe(10);
  });

  it("should return 0 when spread is 0", () => {
    const result = calculateProfitRate(0, 100);
    expect(result).toBe(0);
  });

  it("should return negative profit rate when spread is negative", () => {
    const result = calculateProfitRate(-10, 100);
    expect(result).toBe(-10);
  });

  it("should return 0 when buyAsk is 0", () => {
    const result = calculateProfitRate(10, 0);
    expect(result).toBe(0);
  });
});
