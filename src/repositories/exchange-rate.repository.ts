type ExchangeRate = {
  bid: number;
  ask: number;
};

export const ExchangeRateRepository = () => {
  let exchangeRate: ExchangeRate | null = null;

  const updateExchangeRate = (newExchangeRate: ExchangeRate) => {
    exchangeRate = newExchangeRate;
  };

  const getExchangeRate = () => {
    return exchangeRate;
  };

  return { updateExchangeRate, getExchangeRate } as const;
};
