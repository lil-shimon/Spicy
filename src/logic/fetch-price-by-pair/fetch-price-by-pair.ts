import {
  fetchBinance,
  fetchBybit,
  fetchKucoin,
  fetchMexc,
} from '../../clients';
import { Pair, EXCHANGES, Exchange } from '../../constants';

export const fetchPriceByPair = async (pair: Pair) => {
  try {
    return await fetchPriceByPairPromise(pair);
  } catch (err) {
    console.error('データ取得に失敗しました:', err);
    return null;
  }
};

const wrapWithCatch = async (
  exchange: Exchange,
  fn: () => Promise<{ bid: number; ask: number }>
) => {
  try {
    return await fn();
  } catch (err) {
    console.error(`${exchange} の価格取得に失敗しました`, err);
    return {
      bid: 0,
      ask: 0,
    };
  }
};

const fetchPriceByPairPromise = async (pair: Pair) => {
  const promises = [
    wrapWithCatch(EXCHANGES.BYBIT, () => fetchBybit(pair)),
    wrapWithCatch(EXCHANGES.MEXC, () => fetchMexc(pair)),
    wrapWithCatch(EXCHANGES.BINANCE, () => fetchBinance(pair)),
    wrapWithCatch(EXCHANGES.kucoin, () => fetchKucoin(pair)),
  ];
  const [bybit, mexc, binance, kucoin] = await Promise.all(promises);
  console.log(
    `価格取得結果: Bybit: ${bybit}, MEXC: ${mexc}, Binance: ${binance}, Kucoin: ${kucoin}`
  );

  return {
    bybit,
    mexc,
    binance,
    kucoin,
  };
};
