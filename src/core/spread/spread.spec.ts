import { describe, it, expect } from "vitest";
import { calculateSpread } from "./spread";

describe("calculateSpread", () => {
  it("should calculate the spread correctly", () => {
    const result = calculateSpread(70, 100);
    expect(result).toBe(30);
  });
});
