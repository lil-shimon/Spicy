export const EXCHANGES = {
  BINANCE: "binance",
  BYBIT: "bybit",
  MEXC: "mexc",
} as const;

export type Exchange = (typeof EXCHANGES)[keyof typeof EXCHANGES];

export const exchangeList = Object.values(EXCHANGES) as Exchange[];

export const TAKER_FEES = {
  // https://www.binance.com/en/fee/schedule
  // BNB(Binance Coin)を使用している場合は、0.075%の手数料が適用される
  [EXCHANGES.BINANCE]: 0.1,
  // https://www.bybit.com/en/help-center/article/Trading-Fee-Structure
  [EXCHANGES.BYBIT]: 0.1,
  // https://www.mexc.com/ja-JP/fee
  [EXCHANGES.MEXC]: 0.05,
} as const;

export const PAIRS = {
  ADA_USDT: "ADA/USDT",
  XO_USDT: "XO/USDT",
  DOT_USDT: "DOT/USDT",
} as const;

export type Pair = (typeof PAIRS)[keyof typeof PAIRS];