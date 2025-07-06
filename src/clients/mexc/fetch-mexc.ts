import { mexc } from "ccxt";
import { Pair } from "../../constants";

export const fetchMexc = async (pair: Pair) => {
  const client = new mexc();
  const ticker = await client.fetchTicker(pair);

  return {
    // NOTE: レスポンスがNum形になっているので、nullチェックを行う
    // もしnullの場合は0を返す
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};
