import {
  exchangeList,
  Pair,
  PAIRS,
  TAKER_FEES,
  Exchange,
} from "../../constants";
import { calculateSpread, calculateProfitRate } from "../../core";
import { fetchPriceByPair } from "../fetch-price-by-pair/fetch-price-by-pair";

export type FetchPriceResult = {
  pair: Pair;
  from: Exchange;
  to: Exchange;
  profit: number;
};

const atRate = (percentage: number) => percentage / 100;

export const fetchPrices = async () => {
  const pricesResult = await Promise.all(
    Object.entries(PAIRS).map(async ([key, pair]) => {
      const prices = await fetchPriceByPair(pair);
      console.log(`Prices for ${key}:`, prices);
      return { pair, prices };
    })
  );
  console.log("価格取得結果:", JSON.stringify(pricesResult));

  const result: FetchPriceResult[] = [];

  for (const { pair, prices } of pricesResult) {
    if (!prices) {
      continue;
    }

    console.log(`===== ${pair} の価格比較 =====`);

    for (const from of exchangeList) {
      for (const to of exchangeList) {
        if (from === to) {
          // 同じ取引所間の比較はスキップ
          continue;
        }

        if (prices[from].ask === 0 || prices[to].bid === 0) {
          // どちらかの取引所の価格が取得できない場合はスキップ
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
          `${pair} スプレッド (${from} Ask ${prices[from].ask} - ${to} Bid ${prices[to].bid}): ${spread}, 利益率: ${profitRate}`
        );

        if (profitRate > 0) {
          result.push({ pair, from, to, profit: profitRate });
        }
      }
    }
  }

  return result;
};
