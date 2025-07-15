export const EXCHANGES = {
  BYBIT: 'bybit',
  MEXC: 'mexc',
  // kucoin: "kucoin",
} as const;

export type Exchange = (typeof EXCHANGES)[keyof typeof EXCHANGES];

export const exchangeList = Object.values(EXCHANGES) as Exchange[];

export const TAKER_FEES = {
  // https://www.binance.com/en/fee/schedule
  // BNB(Binance Coin)を使用している場合は、0.075%の手数料が適用される
  // [EXCHANGES.BINANCE]: 0.1,
  // https://www.bybit.com/en/help-center/article/Trading-Fee-Structure
  [EXCHANGES.BYBIT]: 0.1,
  // https://www.mexc.com/ja-JP/fee
  [EXCHANGES.MEXC]: 0.05,
  // https://www.kucoin.com/ja/vip/privilege
  // [EXCHANGES.kucoin]: 0.1,
} as const;

export const PAIRS = {
  // ADA_USDT: "ADA/USDT",
  XO_USDT: 'XO/USDT',
  // DOT_USDT: "DOT/USDT",
  // ADA_USDC: "ADA/USDC",
  // NOTE: USDCで見たいけど、取引ペアがないので、USDTで代用
  // DOT_USDC: "DOT/USDC",
  // XO_USDC: "XO/USDC",
  // HNT_USDT: 'HNT/USDT', // MEXCのAPIが対応していないため除外
  // WLD_USDT: "WLD/USDT",
  SOL_USDT: 'SOL/USDT',
  PUMP_USDT: 'PUMP/USDT',
  ZRO_USDT: 'ZRO/USDT',
} as const;

export type Pair = (typeof PAIRS)[keyof typeof PAIRS];

export const ARBITRAGE_PROFIT_THRESHOLD = 0.005; // 0.5%
