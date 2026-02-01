import { fetchExchangeRate } from '../../../clients/gmo';
import { PriceRepository } from './../repositories/price.repository';

type ExchangeRateServiceParams = {
  priceRepository: ReturnType<typeof PriceRepository>;
};

export const ExchangeRateService = (params: ExchangeRateServiceParams) => {
  const { priceRepository } = params;

  const _update = async () => {
    // 為替レートを取得して内部状態を更新するロジックをここに実装
    try {
      const symbol = 'USD_JPY';
      const response = await fetchExchangeRate({ symbol });

      if (response?.ask !== undefined && response?.bid !== undefined) {
        priceRepository.updatePrice(
          symbol,
          'gmo',
          Number(response?.bid),
          Number(response?.ask)
        );
      }
    } catch (error) {
      console.error('為替レートの更新中にエラーが発生しました:', error);
    }
  };

  const start = () => {
    _update();
    // 1分ごとに為替レートを更新
    setInterval(_update, 1 * 60 * 1000);
  };

  return {
    start,
  } as const;
};
