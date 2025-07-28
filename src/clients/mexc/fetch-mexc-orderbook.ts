import { Pair } from '../../constants';
import { mexcClient } from './mexc-client';

export const fetchMexcOrderbook = async (pair: Pair) => {
  const orderbook = await mexcClient.fetchOrderBook(pair);

  return {
    bids: orderbook.bids ?? [],
    asks: orderbook.asks ?? [],
  };
};
