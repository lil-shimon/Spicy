import { mexc } from "ccxt";

export const fetchMexc = async () => {
  const client = new mexc();
  const ticker = await client.fetchTicker("ADA/USDT");

  return {
    // NOTE: レスポンスがNum形になっているので、nullチェックを行う
    // もしnullの場合は0を返す
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};
