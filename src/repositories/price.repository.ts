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
  ) => {
    const key = `${symbol}::${exchange}`;
    price.set(key, { bid, ask });
  };

  return {
    price,
    updatePrice,
  };
};
