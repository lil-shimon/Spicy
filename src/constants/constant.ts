export const EXCHANGES = {
  BYBIT: 'bybit',
  MEXC: 'mexc',
  BINANCE: 'binance',
  kucoin: 'kucoin',
  GMO: 'gmo',
} as const;

export type Exchange = (typeof EXCHANGES)[keyof typeof EXCHANGES];

/**
 * @deprecated 現状は未使用。必要になれば `Object.values(EXCHANGES)` から都度生成してください。
 */
export const exchangeList = Object.values(EXCHANGES) as Exchange[];

/**
 * @deprecated 現状は参照されていません。必要になれば使用箇所で直接管理してください。
 */
export const TAKER_FEES = {
  // https://www.binance.com/en/fee/schedule
  // BNB(Binance Coin)を使用している場合は、0.075%の手数料が適用される
  [EXCHANGES.BINANCE]: 0.1,
  // https://www.bybit.com/en/help-center/article/Trading-Fee-Structure
  [EXCHANGES.BYBIT]: 0.1,
  // https://www.mexc.com/ja-JP/fee
  [EXCHANGES.MEXC]: 0.05,
  // https://www.kucoin.com/ja/vip/privilege
  [EXCHANGES.kucoin]: 0.1,
  // https://coin.z.com/jp/corp/guide/fees/
  [EXCHANGES.GMO]: 0.09,
} as const;

export const MAKER_FEES_SPOT = {
  [EXCHANGES.MEXC]: 0,
  // https://coin.z.com/jp/corp/guide/fees/
  // BTC, ETH, XRP, DAIはMaker Rebateで-0.01
  // それ以外は-0.03
  [EXCHANGES.GMO]: 0.003,
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

/**
 * @deprecated 現状の判定ロジックでは未使用。使用時に意図したしきい値か確認してください。
 */
export const ARBITRAGE_PROFIT_THRESHOLD = 0.01; // 1%
