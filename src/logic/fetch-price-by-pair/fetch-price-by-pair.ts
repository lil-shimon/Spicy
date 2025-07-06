import { fetchBinance, fetchBybit, fetchMexc } from "../../clients";
import { Pair } from "../../constants";

export const fetchPriceByPair = async (pair: Pair) => {
  try {
    const binancePrice = await fetchBinance(pair);
    const bybitPrice = await fetchBybit(pair);
    const mexcPrice = await fetchMexc(pair);

    return {
      binance: binancePrice,
      bybit: bybitPrice,
      mexc: mexcPrice,
    };
  } catch (err) {
    console.log("データ取得に失敗しました:", err);
    return null;
  }
};
