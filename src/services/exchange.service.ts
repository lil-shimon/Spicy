import { fetchJpyUsd } from '../clients/gmo/gmo';
import { ExchangeRepository } from '../repositories/exchange.repository';

const exchangeRepository = ExchangeRepository();

type ExchangeServiceParams = {
  interval?: number;
};

export const ExchangeService = () => {
  let intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the exchange rate updates.
   * @param params.interval - Parameters for interval. default: 1min.
   */
  const start = (params: ExchangeServiceParams) => {
    func();
    const interval = params.interval || 1000 * 60 * 1;

    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = setInterval(func, interval);
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
    console.log(
      '為替レートが更新されました。',
      exchangeRepository.getExchangeRate()
    );
  };

  return { start } as const;
};
