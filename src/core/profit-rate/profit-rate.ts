export const calculateProfitRate = (spread: number, buyAsk: number) => {
  const rate = (spread / buyAsk) * 100;
  return rate;
};
