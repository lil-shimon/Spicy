export const calculateSpreadRate = (
  bestBid: number,
  bestAsk: number
): number => {
  return ((bestAsk - bestBid) / bestBid) * 100;
};
