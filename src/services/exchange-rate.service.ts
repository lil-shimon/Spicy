import { fetchJpyUsd } from '../clients/gmo/gmo';
import { ExchangeRateRepository } from '../repositories/exchange-rate.repository';

type ExchangeRateServiceParams = {
  exchangeRateRepository: ReturnType<typeof ExchangeRateRepository>;
};

type ExchangeRateServiceStartParams = {
  interval?: number;
};

export const ExchangeRateService = (params: ExchangeRateServiceParams) => {
  const { exchangeRateRepository } = params;
  let intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the exchange rate updates.
   * @param params.interval - Parameters for interval. default: 1min.
   */
  const start = (params: ExchangeRateServiceStartParams) => {
    func();
    const interval = params.interval || 1000 * 60 * 1;

    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = setInterval(func, interval);
  };

  const func = async () => {
    try {
      const response = await fetchJpyUsd();
      if (!response) {
        console.error('為替レートの取得に失敗しました。');
        return;
      }
      exchangeRateRepository.updateExchangeRate({
        bid: response?.bid,
        ask: response?.ask,
      });
      console.log(
        '為替レートが更新されました。',
        exchangeRateRepository.getExchangeRate()
      );
    } catch (error) {
      console.error('為替レート取得エラー:', error);
    }
  };

  const toJpy = (price: { ask: number; bid: number }) => {
    const exchangeRate = exchangeRateRepository.getExchangeRate();
    if (!exchangeRate) {
      return;
    }

    const bidToJpy = price.bid * exchangeRate.ask;
    const askToJpy = price.ask * exchangeRate.bid;

    return {
      bid: bidToJpy,
      ask: askToJpy,
    };
  };

  return { start, toJpy } as const;
};
