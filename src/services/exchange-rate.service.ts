export const ExchangeRateService = () => {
  const _update = () => {
    // 為替レートを取得して内部状態を更新するロジックをここに実装
    try {
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
