import { Triangle } from './types';

export const TRIANGLES: Triangle[] = [
  { name: 'DOGE', base: 'BTC-USDT', mid: 'DOGE-BTC', out: 'DOGE-USDT' },
  { name: 'ADA', base: 'BTC-USDT', mid: 'ADA-BTC', out: 'ADA-USDT' },
  { name: 'ETH', base: 'BTC-USDT', mid: 'ETH-BTC', out: 'ETH-USDT' },
  { name: 'XMR', base: 'BTC-USDT', mid: 'XMR-BTC', out: 'XMR-USDT' },
  { name: 'XRP', base: 'BTC-USDT', mid: 'XRP-BTC', out: 'XRP-USDT' },
  { name: 'LTC', base: 'BTC-USDT', mid: 'LTC-BTC', out: 'LTC-USDT' },
  { name: 'KCS', base: 'BTC-USDT', mid: 'KCS-BTC', out: 'KCS-USDT' },
];

export const ALL_PAIRS = Array.from(
  new Set(TRIANGLES.flatMap((t) => [t.base, t.mid, t.out]))
);
