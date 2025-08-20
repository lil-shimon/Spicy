type CheckParams = {
  exchangeA: { ask: number; bid: number };
  exchangeB: { ask: number; bid: number };
};

export const ArbitrageService = () => {
  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;
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
