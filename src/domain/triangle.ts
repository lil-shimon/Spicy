type Params = {
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

export type Result = {
  ok: boolean;
  usdtOut: number;
  roi: number;
};

export const calcTriangleArbitrage = (params: Params): Result => {
  const { buyBtcPair, buyStablePair, buyTokenPair, takerFee } = params;

  // --- 調整したければここを変える ---
  const USDT_IN = 1; // 基準入力（1USDTで倍率を見る）
  const EPSILON = 0.001; // 安全マージン 0.1%（手数料・微スリッページ吸収）
  // -----------------------------------

  // --- ガード ---
  const { ask: p1 } = buyBtcPair;
  const { ask: p2 } = buyTokenPair;
  const { bid: p3 } = buyStablePair;

  if (p1 <= 0 || p2 <= 0 || p3 <= 0) {
    return { ok: false, usdtOut: 0, roi: -1 };
  }

  const btc = (USDT_IN / p1) * (1 - takerFee);
  const doge = (btc / p2) * (1 - takerFee);
  const usdtOut = doge * p3 * (1 - takerFee);

  const multiplier = usdtOut / USDT_IN;
  const roi = multiplier - 1;

  const ok = multiplier > 1 + EPSILON;

  return { ok, usdtOut, roi };
};
