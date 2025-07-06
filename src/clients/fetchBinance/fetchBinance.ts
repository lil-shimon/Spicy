import { binance } from "ccxt";

export const fetchBinance = async () => {
  const client = new binance();
  const ticker = await client.fetchTicker("ADA/USDT");
  return {
    // NOTE: レスポンスがNum形になっているので、nullチェックを行う
    // もしnullの場合は0を返す
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};
