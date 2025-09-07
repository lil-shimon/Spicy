import type { Params, Result, Detail } from './types';

export const calcTriangleArbitrage = (params: Params): Result => {
  const { buyBtcPair, buyStablePair, buyTokenPair, takerFee } = params;

  // --- 調整したければここを変える ---
  const USDT_IN = 1; // 基準入力（1USDTで倍率を見る）
  const EPSILON = 0.001; // 安全マージン 0.1%（手数料・微スリッページ吸収）
  // -----------------------------------

  // --- ガード ---
  const { ask: baseAsk } = buyBtcPair;
  const { ask: midAsk } = buyTokenPair;
  const { bid: outBid } = buyStablePair;

  const detail: Detail = {
    baseAsk: baseAsk,
    midAsk: midAsk,
    outBid: outBid,
    takerFee,
    epsilon: EPSILON,
  };

  if (baseAsk <= 0 || midAsk <= 0 || outBid <= 0) {
    return { ok: false, usdtIn: USDT_IN, usdtOut: 0, roi: -1, detail };
  }

  const base = (USDT_IN / baseAsk) * (1 - takerFee);
  const mid = (base / midAsk) * (1 - takerFee);
  const out = mid * outBid * (1 - takerFee);

  const multiplier = out / USDT_IN;
  const roi = multiplier - 1;

  const ok = multiplier > 1 + EPSILON;

  return { ok, usdtIn: USDT_IN, usdtOut: out, roi, detail };
};
