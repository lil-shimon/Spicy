import { Pair } from '../../constants';
import { bybitClient } from './bybit-client';

export const fetchBybitOrderbook = async (pair: Pair) => {
  const orderbook = await bybitClient.fetchOrderBook(pair);
  console.log(`Bybit Orderbook for ${pair}:`, orderbook);

  return {
    bids: orderbook.bids ?? [],
    asks: orderbook.asks ?? [],
  };
};
