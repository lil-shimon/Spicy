import {
  fetchBinance,
  fetchBybit,
  fetchMexc,
  fetchKucoin,
} from "../../clients";
import { Pair } from "../../constants";

export const fetchPriceByPair = async (pair: Pair) => {
  try {
    return await fetchPriceByPairPromise(pair);
  } catch (err) {
    console.log("データ取得に失敗しました:", err);
    return null;
  }
};

const fetchPriceByPairPromise = async (pair: Pair) => {
  const promises = [
    fetchBinance(pair),
    fetchBybit(pair),
    fetchMexc(pair),
    fetchKucoin(pair),
  ];
  const [binance, bybit, mexc, kucoin] = await Promise.all(promises);
  console.log(
    `価格取得結果: Binance: ${binance}, Bybit: ${bybit}, MEXC: ${mexc}, Kucoin: ${kucoin}`
  );
  return {
    binance,
    bybit,
    mexc,
    kucoin,
  };
};