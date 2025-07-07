import { exchangeList, PAIRS, TAKER_FEES } from "../../constants";
import { calculateSpread, calculateProfitRate } from "../../core";
import { fetchPriceByPair } from "../fetch-price-by-pair/fetch-price-by-pair";

const atRate = (percentage: number) => percentage / 100;

export const fetchPrices = async () => {
  const pricesResult = await Promise.all(
    Object.entries(PAIRS).map(async ([key, pair]) => {
      const prices = await fetchPriceByPair(pair);
      console.log(`Prices for ${key}:`, prices);
      return { key, prices };
    })
  );
  console.log("Prices Result:", pricesResult);

  for (const { key, prices } of pricesResult) {
    if (!prices) {
      continue;
    }

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
          `${key} スプレッド (${from} Ask ${prices[from].ask} - ${to} Bid ${prices[to].bid}): ${spread}, 利益率: ${profitRate}`
        );
      }
    }
  }

  return 0;
};
