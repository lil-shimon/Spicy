type Book = {
  bid: number;
  ask: number;
};

export const PriceRepository = () => {
  // key is ${symbol}::${exchange}
  const price = new Map<string, Book>();

  const updatePrice = (
    symbol: string,
    exchange: string,
    bid: number,
    ask: number
  ): boolean => {
    const key = `${symbol}::${exchange}`;
    const currentPrice = price.get(key);
    if (currentPrice?.bid !== bid || currentPrice?.ask !== ask) {
      price.set(key, { bid, ask });
      return true;
    }
    return false;
  };

  const getPrice = (symbol: string, exchange: string) => {
    const key = `${symbol}::${exchange}`;
    return price.get(key);
  };

  return {
    updatePrice,
    getPrice,
  } as const;
};
