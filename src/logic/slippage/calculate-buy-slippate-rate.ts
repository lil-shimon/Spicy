import { OrderBookEntry } from "./calculate-buy-slippage-rate.types";

export const calculateBuySlippageRate = (
  asks: OrderBookEntry[],
  tradeAmount: number
) => {
  /**
   * 今までの取引で消費した数量を累積する変数
   */
  let accumulatedAmount = 0;

  /**
   * 現在の取引にかかるコストを累積する変数
   */
  let totalCost = 0;

  for (const [price, amount] of asks) {
    const tradableAmount = Math.min(tradeAmount, amount);
    totalCost += tradableAmount * price;
    accumulatedAmount += tradableAmount;

    if (accumulatedAmount >= tradeAmount) {
      break;
    }
  }

  if (accumulatedAmount < tradeAmount) {
    // Errorを投げるかどうかは要検討
    throw new Error("注文量に対して板が薄すぎます");
  }

  const averagePrice = totalCost / tradeAmount;
  // asksの一番目の価格を取得
  const bestAskPrice = asks[0][0];

  const slippageRate = ((averagePrice - bestAskPrice) / averagePrice) * 100;
  return slippageRate;
};
