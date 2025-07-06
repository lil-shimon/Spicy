export const EXCHANGES = {
  BINANCE: "binance",
  BYBIT: "bybit",
} as const;

export const TAKER_FEES = {
  // https://www.binance.com/en/fee/schedule
  // BNB(Binance Coin)を使用している場合は、0.075%の手数料が適用される
  [EXCHANGES.BINANCE]: 0.1,
  // https://www.bybit.com/en/help-center/article/Trading-Fee-Structure
  [EXCHANGES.BYBIT]: 0.1,
} as const;
