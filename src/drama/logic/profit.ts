/**
 * 往復Maker手数料をカバーするのに必要な最小tick数を計算
 * w_min = ⌈(2 * f_eff * P) / τ⌉
 *
 * @param feeRate 片道の手数料率（%）
 * @param price 現在の価格 (midを想定)
 * @param tickSize ティックサイズ
 */
const calcMinRequiredTickSize = (
  feeRate: number,
  price: number,
  tickSize: number
) => {
  return Math.ceil((2 * feeRate * price) / tickSize);
};

/**
 * 現在のスプレッドが往復Maker手数料をカバーして利益が出るか判定
 * currentTicks > w_min の場合に利益が出る
 *
 * @param feeRate 片道の手数料率（%）
 * @param bestBid 最良買い注文価格
 * @param bestAsk 最良売り注文価格
 * @param tickSize ティックサイズ
 * @returns 利益が出る場合true、出ない場合false
 */
export const hasProfit = (
  feeRate: number,
  bestBid: number,
  bestAsk: number,
  tickSize: number
) => {
  const mid = (bestBid + bestAsk) / 2;
  const wMin = calcMinRequiredTickSize(feeRate, mid, tickSize);
  const currentTicks = (bestAsk - bestBid) / tickSize;
  return currentTicks > wMin;
};
