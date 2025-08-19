export const ExchangeRepository = () => {
  let exchangeRate: number | null = null;

  const updateExchangeRate = (rate: number) => {
    exchangeRate = rate;
  };

  const getExchangeRate = () => {
    return exchangeRate;
  };

  return { updateExchangeRate, getExchangeRate } as const;
};
