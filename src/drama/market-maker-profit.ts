import { calculateSpreadRate } from '../dirty-work/spread';

export interface MarketMakerProfitResult {
  spreadRate: number;
  roundTripFee: number;
  netProfit: number;
  isProfitable: boolean;
}

/**
 * マーケットメイカーとしての収益性を判断
 * @param bestBid 最良買い気配値
 * @param bestAsk 最良売り気配値
 * @param makerFee メイカー手数料（%）デフォルトはKuCoin先物の0.02%
 * @param minProfitThreshold 最小利益閾値（%）デフォルトは0.01%
 * @returns 収益性の判断結果
 */
export const calculateMarketMakerProfit = (
  bestBid: number,
  bestAsk: number,
  makerFee: number = 0.02,
  minProfitThreshold: number = 0.01
): MarketMakerProfitResult => {
  // スプレッド率を計算（%）
  const spreadRate = calculateSpreadRate(bestBid, bestAsk);

  // 往復手数料（買い注文 + 売り注文）
  const roundTripFee = makerFee * 2;

  // 手数料を差し引いた実質利益
  const netProfit = spreadRate - roundTripFee;

  // 最小利益閾値を超えているか判定
  const isProfitable = netProfit > minProfitThreshold;

  return {
    spreadRate,
    roundTripFee,
    netProfit,
    isProfitable,
  };
};
