export const EXCHANGES = {
  BYBIT: 'bybit',
  MEXC: 'mexc',
  BINANCE: 'binance',
  kucoin: 'kucoin',
} as const;

export type Exchange = (typeof EXCHANGES)[keyof typeof EXCHANGES];

export const MAKER_FEES_SPOT = {
  [EXCHANGES.MEXC]: 0,
  // https://www.kucoin.com/ja/vip/privilege
  // 0.1%
  [EXCHANGES.kucoin]: 0.001,
};

export const MAKER_FEES_FUTURES = {
  // https://www.kucoin.com/ja/vip/privilege
  // 先物取引のメイカー手数料
  [EXCHANGES.kucoin]: 0.0002, // 0.02% for futures maker
} as const;

export const PAIRS = {
  XO_USDT: 'XO/USDT',
  SOL_USDT: 'SOL/USDT',
  PUMP_USDT: 'PUMP/USDT',
} as const;

export type Pair = (typeof PAIRS)[keyof typeof PAIRS];
