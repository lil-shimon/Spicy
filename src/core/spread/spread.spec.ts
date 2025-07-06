import { describe, it, expect } from "vitest";
import { calculateSpread } from "./spread";

describe("calculateSpread", () => {
  it("should calculate the spread correctly", () => {
    const result = calculateSpread(70, 100, 0.001, 0.001);
    expect(result).toBe(29.830000000000013);
  });

  it("should return 0 if the spread is negative", () => {
    const result = calculateSpread(100, 70, 0.001, 0.001);
    expect(result).toBe(0);
  });
});
