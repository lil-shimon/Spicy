export const ExchangeRepository = () => {
  let exchangeRate: number = 0;

  const updateExchangeRate = (rate: number) => {
    exchangeRate = rate;
  };

  const getExchangeRate = () => {
    return exchangeRate;
  };

  return { updateExchangeRate, getExchangeRate } as const;
};
