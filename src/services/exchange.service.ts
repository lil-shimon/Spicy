import { fetchJpyUsd } from '../clients/gmo/gmo';
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

    setInterval(func, interval);
  };

  const func = async () => {
    const response = await fetchJpyUsd();
    if (!response) {
      console.log('為替レートの取得に失敗しました。');
      return;
    }
    exchangeRepository.updateExchangeRate({
      bid: response?.bid,
      ask: response?.ask,
    });
  };

  return { start } as const;
};
