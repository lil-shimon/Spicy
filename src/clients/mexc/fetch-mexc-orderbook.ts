import { Pair } from '../../constants';
import { mexcClient } from './mexc-client';

export const fetchMexcOrderbook = async (pair: Pair) => {
  const orderbook = await mexcClient.fetchOrderBook(pair);
  console.log(`MEXC Orderbook for ${pair}:`, orderbook);

  return {
    bids: orderbook.bids ?? [],
    asks: orderbook.asks ?? [],
  };
};
