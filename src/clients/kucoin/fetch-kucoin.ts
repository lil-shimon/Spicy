import { kucoinClient } from './kucoin-client';
import { Pair, PAIRS } from '../../constants';

export const fetchKucoin = async (pair: Pair) => {
  if (pair === PAIRS.XO_USDT) {
    return {
      bid: 0,
      ask: 0,
    };
  }

  try {
    const ticker = await kucoinClient.fetchTicker(pair);

    return {
      // NOTE: レスポンスがNum形になっているので、nullチェックを行う
      // もしnullの場合は0を返す
      bid: ticker.bid ?? 0,
      ask: ticker.ask ?? 0,
    };
  } catch (error) {
    console.error(`kucoin: 価格取得に失敗しました: ${pair}`, error);

    return {
      bid: 0,
      ask: 0,
    };
  }
};
