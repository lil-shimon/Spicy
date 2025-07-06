import { describe, it, expect } from "vitest";
import { getTakerFee } from "./taker-fee";
import { EXCHANGES } from "../../constants";

describe("Taker Fee", () => {
  it("should return the correct taker fee for Binance", () => {
    const fee = getTakerFee(EXCHANGES.BINANCE);
    expect(fee).toBe(0.1);
  });

  it("should return the correct taker fee for Bybit", () => {
    const fee = getTakerFee(EXCHANGES.BYBIT);
    expect(fee).toBe(0.1);
  });
});
