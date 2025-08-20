type CheckParams = {
  exchangeA: { ask: number; bid: number };
  exchangeB: { ask: number; bid: number };
};

export const ArbitrageService = () => {
  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;
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
