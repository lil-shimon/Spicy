import { fetchExchangeRate } from '../clients/gmo';

export const ExchangeRateService = () => {
  const _update = async () => {
    // 為替レートを取得して内部状態を更新するロジックをここに実装
    try {
      const symbol = 'USD_JPY';
      const response = await fetchExchangeRate({ symbol });
      console.log('為替レート:', response);
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
