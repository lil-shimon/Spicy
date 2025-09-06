export const tokenList = ['BTC', 'USDT', 'DOGE'] as const;

export const generatePairs = (tokens: string[]) => {
  const pairs: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    for (let j = 0; j < tokens.length; j++) {
      if (i !== j) {
        pairs.push(`${tokens[i]}-${tokens[j]}`);
      }
    }
  }
  return pairs;
};
