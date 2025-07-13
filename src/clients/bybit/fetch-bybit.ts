import { bybit } from 'ccxt';
import { Pair } from '../../constants';

export const fetchBybit = async (pair: Pair) => {
  const client = new bybit();
  const ticker = await client.fetchTicker(pair);
  return {
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};
