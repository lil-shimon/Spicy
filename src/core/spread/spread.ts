export const calculateSpread = (
  buyAsk: number,
  sellBid: number,
  buyTakerFeeRate: number,
  sellTakerFreeRate: number
) => {
  const effectiveBuyAsk = buyAsk * (1 + buyTakerFeeRate);
  const effectiveSellBid = sellBid * (1 - sellTakerFreeRate);

  const spread = effectiveSellBid - effectiveBuyAsk;
  console.log("計算されたスプレッド:", spread);
  return spread < 0 ? 0 : spread;
};
