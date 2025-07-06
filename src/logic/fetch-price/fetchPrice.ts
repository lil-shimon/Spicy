import { fetchBinance, fetchBybit } from "../../clients";
import { calculateSpread, calculateProfitRate } from "../../core";

export const fetchPrices = async () => {
  const binancePrice = await fetchBinance();
  const bybitPrice = await fetchBybit();

  const spread = calculateSpread(binancePrice.ask, bybitPrice.bid);

  console.log("スプレッド (Binance Ask - Bybit Bid):", spread);

  const profitRate = calculateProfitRate(spread, binancePrice.ask);
  console.log("利益率 (スプレッド / Binance Ask):", profitRate);

  return profitRate;
};
