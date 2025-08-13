import { roundDown, roundUp } from '../../utils/round/round';

const FULL_SPREAD = 0.0001;
const HALF = FULL_SPREAD / 2;

type GetPricesParams = {
  bestBid: number;
  bestAsk: number;
  inventory: number;
  amount: number;
  tickSize: number;
};

export const getPrices = ({
  bestBid,
  bestAsk,
  inventory,
  amount,
  tickSize,
}: GetPricesParams) => {
  const mid = (bestBid + bestAsk) / 2;

  let buyPrice = getPrice({
    mid,
    side: 'buy',
    tickSize,
  });
  let sellPrice = getPrice({
    mid,
    side: 'sell',
    tickSize,
  });

  const inventoryWithoutMinAmount = inventory - amount;

  const inventoryShift = (inventoryWithoutMinAmount / amount) * tickSize;
  if (inventory > 0) {
    // 在庫がプラスの場合は、買い価格を下げる
    buyPrice = buyPrice - inventoryShift * 2;
  } else if (inventory < 0) {
    // 在庫がマイナスの場合は、売り価格を上げる
    // inventoryShift はマイナスなので、Math.abs で絶対値に変換する
    sellPrice = sellPrice + Math.abs(inventoryShift * 2);
  }

  return { buyPrice, sellPrice };
};

type GetPriceParams = {
  mid: number;
  side: 'buy' | 'sell';
  tickSize: number;
};

const getPrice = ({ mid, side, tickSize }: GetPriceParams) => {
  const price =
    side === 'buy'
      ? roundDown(mid * (1 - HALF), tickSize)
      : roundUp(mid * (1 + HALF), tickSize);

  return price;
};
