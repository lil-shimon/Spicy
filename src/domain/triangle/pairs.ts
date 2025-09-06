export const generatePairs = (tokens: string[]) => {
  const pairs: string[] = [];

  tokens.forEach((token) => {
    const stablePair = `${token}-USDT`;
    const btcPair = `${token}-BTC`;
    pairs.push(stablePair, btcPair);
  });

  return pairs;
};
