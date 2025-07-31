import { roundDown, roundUp } from '../round';

const FULL_SPREAD = 0.0001;
const HALF = FULL_SPREAD / 2;

type GetPricesParams = {
  bestBid: number;
  bestAsk: number;
  inventory: number;
  amount: number;
  tickSize: number;
};

// TODO: 在庫数も考慮に入れたい
export const getPrices = ({
  bestBid,
  bestAsk,
  inventory,
  amount,
  tickSize,
}: GetPricesParams) => {
  const mid = (bestBid + bestAsk) / 2;

  const buyPrice = getPrice({
    mid,
    side: 'buy',
    tickSize,
    inventory,
    amount,
  });
  const sellPrice = getPrice({
    mid,
    side: 'sell',
    tickSize,
    inventory,
    amount,
  });

  return { buyPrice, sellPrice };
};

type GetPriceParams = {
  mid: number;
  side: 'buy' | 'sell';
  tickSize: number;
  inventory: number;
  amount: number;
};

const getPrice = ({
  mid,
  side,
  tickSize,
  inventory,
  amount,
}: GetPriceParams) => {
  const inventoryShift = (inventory / amount) * tickSize;

  const price =
    side === 'buy'
      ? roundDown(mid * (1 - HALF), tickSize) - inventoryShift
      : roundUp(mid * (1 + HALF), tickSize) + inventoryShift;
  return price;
};
