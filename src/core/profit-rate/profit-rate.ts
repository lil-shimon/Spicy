export const calculateProfitRate = (spread: number, buyAsk: number) => {
  if (buyAsk === 0) return 0;

  const rate = (spread / buyAsk) * 100;
  return rate;
};
