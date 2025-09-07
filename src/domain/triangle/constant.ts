import { Triangle } from './types';

export const TRIANGLES: Triangle[] = [
  { name: 'DOGE', base: 'BTC-USDT', mid: 'DOGE-BTC', out: 'DOGE-USDT' },
  { name: 'ADA', base: 'BTC-USDT', mid: 'ADA-BTC', out: 'ADA-USDT' },
];

export const ALL_PAIRS = Array.from(
  new Set(TRIANGLES.flatMap((t) => [t.base, t.mid, t.out]))
);
