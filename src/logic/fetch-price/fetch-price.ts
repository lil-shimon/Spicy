import { EXCHANGES, PAIRS, TAKER_FEES } from "../../constants";
import { calculateSpread, calculateProfitRate } from "../../core";
import { fetchPriceByPair } from "../fetch-price-by-pair/fetch-price-by-pair";

const atRate = (percentage: number) => percentage / 100;

export const fetchPrices = async () => {
  const pair = PAIRS.ADA_USDT;

  const prices = await fetchPriceByPair(pair);

  if (!prices) {
    return;
  }

  const { binance, bybit, mexc } = prices;

  const binanceTakerFeeRate = atRate(TAKER_FEES[EXCHANGES.BINANCE]);
  const bybitTakerFeeRate = atRate(TAKER_FEES[EXCHANGES.BYBIT]);

  const spread = calculateSpread(
    binance.ask,
    bybit.bid,
    binanceTakerFeeRate,
    bybitTakerFeeRate
  );

  console.log("スプレッド (Binance Ask - Bybit Bid):", spread);

  const profitRate = calculateProfitRate(spread, binance.ask);
  console.log("利益率 (スプレッド / Binance Ask):", profitRate);

  return profitRate;
};
