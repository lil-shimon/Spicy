import { roundDown, roundUp } from './round';

const FULL_SPREAD = 0.0001;
const HALF = FULL_SPREAD / 2;

export const getPrices = (
  bestBid: number,
  bestAsk: number,
  sellCancelCount: number,
  buyCancelCount: number,
  tickSize: number
) => {
  const mid = (bestBid + bestAsk) / 2;

  const buyShift = sellCancelCount * (tickSize * 2);
  const sellShift = buyCancelCount * (tickSize * 2);

  const buyPrice = roundDown(mid * (1 - HALF), tickSize) - buyShift;
  const sellPrice = roundUp(mid * (1 + HALF), tickSize) + sellShift;

  return { buyPrice, sellPrice };
};
