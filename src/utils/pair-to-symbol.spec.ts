import { describe, it, expect } from "vitest";
import { pairToSymbol } from "./pair-to-symbol";
import { PAIRS } from "../constants";

describe("pairToSymbol", () => {
  it("should convert pair to symbol", () => {
    const result = pairToSymbol(PAIRS.ADA_USDC);
    expect(result).toBe("ADAUSDC");
  });
});
