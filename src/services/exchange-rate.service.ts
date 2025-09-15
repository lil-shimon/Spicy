export const ExchangeRateService = () => {
  const _update = () => {};

  const start = () => {
    _update();
    // 1分ごとに為替レートを更新
    setInterval(_update, 1 * 60 * 1000);
  };

  return {
    start,
  } as const;
};
