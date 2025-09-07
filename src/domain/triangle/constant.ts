import { Triangle } from './types';

export const TRIANGLES: Triangle[] = [
  { name: 'DOGE', base: 'BTC-USDT', mid: 'DOGE-BTC', out: 'DOGE-USDT' },
  { name: 'ADA', base: 'BTC-USDT', mid: 'ADA-BTC', out: 'ADA-USDT' },
  { name: 'ETH', base: 'BTC-USDT', mid: 'ETH-BTC', out: 'ETH-USDT' },
  { name: 'XMR', base: 'BTC-USDT', mid: 'XMR-BTC', out: 'XMR-USDT' },
  { name: 'XRP', base: 'BTC-USDT', mid: 'XRP-BTC', out: 'XRP-USDT' },
  { name: 'LTC', base: 'BTC-USDT', mid: 'LTC-BTC', out: 'LTC-USDT' },
  { name: 'KCS', base: 'BTC-USDT', mid: 'KCS-BTC', out: 'KCS-USDT' },
  { name: 'DOT', base: 'BTC-USDT', mid: 'DOT-BTC', out: 'DOT-USDT' },
  { name: 'XRP', base: 'ETH-USDT', mid: 'XRP-ETH', out: 'XRP-USDT' },
  { name: 'SOL', base: 'KCS-USDT', mid: 'SOL-KCS', out: 'SOL-USDT' },
  { name: 'XRP', base: 'KCS-USDT', mid: 'XRP-KCS', out: 'XRP-USDT' },
  { name: 'SUI', base: 'KCS-USDT', mid: 'SUI-KCS', out: 'SUI-USDT' },
  { name: 'ADA', base: 'KCS-USDT', mid: 'ADA-KCS', out: 'ADA-USDT' },
  { name: 'HYPE', base: 'KCS-USDT', mid: 'HYPE-KCS', out: 'HYPE-USDT' },
  { name: 'DOGE', base: 'KCS-USDT', mid: 'DOGE-KCS', out: 'DOGE-USDT' },
  { name: 'PEPE', base: 'KCS-USDT', mid: 'PEPE-KCS', out: 'PEPE-USDT' },
];

export const ALL_PAIRS = Array.from(
  new Set(TRIANGLES.flatMap((t) => [t.base, t.mid, t.out]))
);
