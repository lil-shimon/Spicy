import type { Params, Result, Detail } from './types';

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

  const detail: Detail = {
    baseAsk: p1,
    midAsk: p2,
    outBid: p3,
    takerFee,
    epsilon: EPSILON,
  };

  if (p1 <= 0 || p2 <= 0 || p3 <= 0) {
    return { ok: false, usdtIn: USDT_IN, usdtOut: 0, roi: -1, detail };
  }

  const btc = (USDT_IN / p1) * (1 - takerFee);
  const doge = (btc / p2) * (1 - takerFee);
  const usdtOut = doge * p3 * (1 - takerFee);

  const multiplier = usdtOut / USDT_IN;
  const roi = multiplier - 1;

  const ok = multiplier > 1 + EPSILON;

  return { ok, usdtIn: USDT_IN, usdtOut, roi, detail };
};
