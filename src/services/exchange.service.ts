import { ExchangeRepository } from '../repositories/exchange.repository';

const exchangeRepository = ExchangeRepository();

type ExchangeServiceParams = {
  interval?: number;
};

export const ExchangeService = () => {
  /**
   * Start the exchange rate updates.
   * @param params.interval - Parameters for interval. default: 1min.
   */
  const start = (params: ExchangeServiceParams) => {
    const interval = params.interval || 1000 * 60 * 1;

    setInterval(() => {
      // api call
      // update exchange rate.
    }, interval);
  };

  return { start } as const;
};
