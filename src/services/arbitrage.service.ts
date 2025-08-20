import { ExchangeService } from './exchange.service';

type Exchange = {
  ask: number;
  bid: number;
  /**
   * 為替レートでの変換が必要かどうか
   */
  needsConversion?: boolean;
};

type CheckParams = {
  exchangeA: Exchange;
  exchangeB: Exchange;
};

const exchangeService = ExchangeService();

export const ArbitrageService = () => {
  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;

    const a = exchangeA.needsConversion
      ? exchangeService.toJpy(exchangeA)
      : exchangeA;
    const b = exchangeB.needsConversion
      ? exchangeService.toJpy(exchangeB)
      : exchangeB;

    if (!a || !b) {
      return;
    }

    // 指値でMMっぽくする時の比較
    const aToB = compare({ buyPrice: a.bid, sellPrice: b.ask });
    const bToA = compare({ buyPrice: b.bid, sellPrice: a.ask });

    return {
      aToB,
      bToA,
    };
  };

  const compare = ({
    buyPrice,
    sellPrice,
  }: {
    buyPrice: number;
    sellPrice: number;
  }) => {
    return sellPrice - buyPrice;
  };

  return { check } as const;
};
