import { bybit } from 'ccxt';
import { Pair } from '../../constants';

export const fetchBybitOrderbook = async (pair: Pair) => {
  const client = new bybit();
  const orderbook = await client.fetchOrderBook(pair);
  console.log(`Bybit Orderbook for ${pair}:`, orderbook);

  return {
    bids: orderbook.bids ?? [],
    asks: orderbook.asks ?? [],
  };
};
