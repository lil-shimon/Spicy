import { fetchBinance, fetchBybit } from "../../clients";
import { EXCHANGES, TAKER_FEES } from "../../constants";
import { calculateSpread, calculateProfitRate } from "../../core";

const atRate = (percentage: number) => percentage / 100;

export const fetchPrices = async () => {
  const binancePrice = await fetchBinance();
  const bybitPrice = await fetchBybit();

  const binanceTakerFeeRate = atRate(TAKER_FEES[EXCHANGES.BINANCE]);
  const bybitTakerFeeRate = atRate(TAKER_FEES[EXCHANGES.BYBIT]);

  const spread = calculateSpread(
    binancePrice.ask,
    bybitPrice.bid,
    binanceTakerFeeRate,
    bybitTakerFeeRate
  );

  console.log("スプレッド (Binance Ask - Bybit Bid):", spread);

  const profitRate = calculateProfitRate(spread, binancePrice.ask);
  console.log("利益率 (スプレッド / Binance Ask):", profitRate);

  return profitRate;
};
