type CheckParams = {
  exchangeA: { ask: number; bid: number };
  exchangeB: { ask: number; bid: number };
};

export const ArbitrageService = () => {
  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;
  };

  return { check } as const;
};
