import { Pair } from '../../constants';
import { mexcClient } from './mexc-client';

export const fetchMexc = async (pair: Pair) => {
  const ticker = await mexcClient.fetchTicker(pair);
  console.log('MEXC Ticker:', ticker);

  return {
    // NOTE: レスポンスがNum形になっているので、nullチェックを行う
    // もしnullの場合は0を返す
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};
