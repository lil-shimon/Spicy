import { Pair } from '../../constants';
import { binanceClient } from './binance-client';

export const fetchBinance = async (pair: Pair) => {
  try {
    const ticker = await binanceClient.fetchTicker(pair);
    return {
      // NOTE: レスポンスがNum形になっているので、nullチェックを行う
      // もしnullの場合は0を返す
      bid: ticker.bid ?? 0,
      ask: ticker.ask ?? 0,
    };
  } catch (error) {
    console.error(`binance: 価格取得に失敗しました: ${pair}`, error);
    return {
      bid: 0,
      ask: 0,
    };
  }
};
