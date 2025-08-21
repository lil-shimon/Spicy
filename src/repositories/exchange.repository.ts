type ExchangeRate = {
  bid: number;
  ask: number;
};

// TODO: rename from ExchangeRepository. (exchangeRateRepository?)
export const ExchangeRepository = () => {
  let exchangeRate: ExchangeRate | null = null;

  const updateExchangeRate = (newExchangeRate: ExchangeRate) => {
    exchangeRate = newExchangeRate;
  };

  const getExchangeRate = () => {
    return exchangeRate;
  };

  return { updateExchangeRate, getExchangeRate } as const;
};
