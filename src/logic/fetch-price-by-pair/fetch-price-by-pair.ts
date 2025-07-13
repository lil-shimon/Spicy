import { fetchBybit, fetchMexc, fetchKucoin } from '../../clients';
import { Pair } from '../../constants';

export const fetchPriceByPair = async (pair: Pair) => {
  try {
    return await fetchPriceByPairPromise(pair);
  } catch (err) {
    console.log('データ取得に失敗しました:', err);
    return null;
  }
};

const fetchPriceByPairPromise = async (pair: Pair) => {
  const promises = [fetchBybit(pair), fetchMexc(pair), fetchKucoin(pair)];
  const [bybit, mexc, kucoin] = await Promise.all(promises);
  console.log(
    `価格取得結果: Bybit: ${bybit}, MEXC: ${mexc}, Kucoin: ${kucoin}`
  );
  return {
    bybit,
    mexc,
    kucoin,
  };
};
