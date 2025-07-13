import { OrderBookEntry } from './calculate-buy-slippage-rate.types';

export const calculateSellSlippageRate = (
  bids: OrderBookEntry[],
  targetAmount: number
) => {
  let accumulatedAmount = 0;
  let totalCost = 0;

  for (const [price, amount] of bids) {
    const remainingAmount = targetAmount - accumulatedAmount;
    const tradableAmount = Math.min(remainingAmount, amount);
    totalCost += tradableAmount * price;
    accumulatedAmount += tradableAmount;

    if (accumulatedAmount >= targetAmount) {
      break;
    }
  }

  if (accumulatedAmount < targetAmount) {
    throw new Error('注文量に対して板が薄すぎます');
  }

  const averagePrice = totalCost / targetAmount;
  const bestBidPrice = bids[0][0];

  const slippageRate = ((bestBidPrice - averagePrice) / bestBidPrice) * 100;
  return slippageRate;
};
