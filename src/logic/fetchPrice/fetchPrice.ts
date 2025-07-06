import { fetchBinance, fetchBybit } from "../../clients";
import { calculateSpread } from "../../core";

export const fetchPrices = async () => {
  const binancePrice = await fetchBinance();
  const bybitPrice = await fetchBybit();

  const spread = calculateSpread(binancePrice.ask, bybitPrice.bid);

  console.log("スプレッド (Binance Ask - Bybit Bid):", spread);

  return spread;
};
