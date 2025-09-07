export type Params = {
  // BTC/USDTなどを想定
  buyBtcPair: {
    bid: number;
    ask: number;
  };
  // DOGE/BTCなどを想定
  buyTokenPair: {
    bid: number;
    ask: number;
  };
  // DOGE/USDTなどを想定
  buyStablePair: {
    bid: number;
    ask: number;
  };
  takerFee: number;
};

export type Detail = {
  baseAsk: number;
  midAsk: number;
  outBid: number;
  takerFee: number;
  epsilon: number;
};

export type Result = {
  ok: boolean;
  usdtIn: number;
  usdtOut: number;
  roi: number;
  detail: Detail;
};

/**
 * 三角アービトラージの組み合わせを表す型
 */
export type Triangle = {
  /**
   * トークン名
   * e.g. DOGE
   */
  name: string;
  /**
   * base pair.
   * e.g. BTC-USDT
   */
  base: string;
  /**
   * mid pair.
   * e.g. DOGE-BTC
   */
  mid: string;
  /**
   * out pair.
   * e.g. DOGE-USDT
   */
  out: string;
};
