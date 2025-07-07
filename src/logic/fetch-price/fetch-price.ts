import { exchangeList, EXCHANGES, PAIRS, TAKER_FEES } from "../../constants";
import { calculateSpread, calculateProfitRate } from "../../core";
import { fetchPriceByPair } from "../fetch-price-by-pair/fetch-price-by-pair";

const atRate = (percentage: number) => percentage / 100;

export const fetchPrices = async () => {
  const pair = PAIRS.ADA_USDC;

  const prices = await fetchPriceByPair(pair);

  if (!prices) {
    return 0;
  }

  const { binance, bybit } = prices;
  console.log("exchange list", exchangeList);

  for (const from of exchangeList) {
    for (const to of exchangeList) {
      if (from === to) {
        // 同じ取引所間の比較はスキップ
        continue;
      }

      const spread = calculateSpread(
        prices[from].ask,
        prices[to].bid,
        atRate(TAKER_FEES[from]),
        atRate(TAKER_FEES[to])
      );

      const profitRate = calculateProfitRate(spread, prices[from].ask);

      console.log(
        `スプレッド (${from} Ask - ${to} Bid): ${spread}, 利益率: ${profitRate}`
      );
    }
  }

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
