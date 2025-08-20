import { ExchangeRepository } from './../repositories/exchange.repository';
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

const exchangeRepository = ExchangeRepository();

export const ArbitrageService = () => {
  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;

    const shouldConversion =
      exchangeA.needsConversion || exchangeB.needsConversion;

    if (shouldConversion) {
    }

    // 指値でMMっぽくする時の比較
    const aToB = compare({ buyPrice: exchangeA.bid, sellPrice: exchangeB.ask });
    const bToA = compare({ buyPrice: exchangeB.bid, sellPrice: exchangeA.ask });

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
