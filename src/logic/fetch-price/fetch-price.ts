import { fetchBinance, fetchBybit } from "../../clients";
import { EXCHANGES, PAIRS, TAKER_FEES } from "../../constants";
import { calculateSpread, calculateProfitRate } from "../../core";

const atRate = (percentage: number) => percentage / 100;

export const fetchPrices = async () => {
  const pair = PAIRS.ADA_USDT;
  const binancePrice = await fetchBinance(pair);
  const bybitPrice = await fetchBybit(pair);

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
