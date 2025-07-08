import { mexc } from "ccxt";
import { Pair } from "../../constants";

export const fetchMexcOrderbook = async (pair: Pair) => {
  const client = new mexc();
  const orderbook = await client.fetchOrderBook(pair);
  console.log(`MEXC Orderbook for ${pair}:`, orderbook);

  return {
    bids: orderbook.bids ?? [],
    asks: orderbook.asks ?? [],
  };
};
