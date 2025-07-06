export const calculateSpread = (buyAsk: number, sellBid: number) => {
  return sellBid - buyAsk;
};
