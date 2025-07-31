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

  const buyPrice = getPrice({
    cancel: sellCancelCount,
    mid,
    side: 'buy',
    tickSize,
  });
  const sellPrice = getPrice({
    cancel: buyCancelCount,
    mid,
    side: 'sell',
    tickSize,
  });

  return { buyPrice, sellPrice };
};

type GetPriceParams = {
  cancel: number;
  mid: number;
  side: 'buy' | 'sell';
  tickSize: number;
};
const getPrice = ({ cancel, mid, side, tickSize }: GetPriceParams) => {
  const shift = cancel * (tickSize * 2);
  const price =
    side === 'buy'
      ? roundDown(mid * (1 - HALF), tickSize) - shift
      : roundUp(mid * (1 + HALF), tickSize) + shift;
  return price;
};
