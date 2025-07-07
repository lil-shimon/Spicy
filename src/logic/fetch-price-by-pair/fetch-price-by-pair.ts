import {
  fetchBinance,
  fetchBybit,
  fetchMexc,
  fetchKucoin,
} from "../../clients";
import { Pair } from "../../constants";

export const fetchPriceByPair = async (pair: Pair) => {
  try {
    const binancePrice = await fetchBinance(pair);
    const bybitPrice = await fetchBybit(pair);
    const mexcPrice = await fetchMexc(pair);
    const kucoinPrice = await fetchKucoin(pair);

    return {
      binance: binancePrice,
      bybit: bybitPrice,
      mexc: mexcPrice,
      kucoin: kucoinPrice,
    };
  } catch (err) {
    console.log("データ取得に失敗しました:", err);
    return null;
  }
};
