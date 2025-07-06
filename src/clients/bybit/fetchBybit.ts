import { bybit } from "ccxt";

export const fetchBybit = async () => {
  const client = new bybit();
  const ticker = await client.fetchTicker("ADA/USDT");
  return {
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};
