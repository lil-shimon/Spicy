type Book = {
  bid: number;
  ask: number;
};

export const PriceRepository = () => {
  // key is ${symbol}::${exchange}
  const price = new Map<string, Book>();

  // TODO: updatePriceメソッドを改修
  // - 戻り値をboolean型に変更（価格が変更されたかを返す）
  // - 現在の価格と新しい価格を比較
  // - 変更があった場合のみMapを更新してtrueを返す
  const updatePrice = (
    symbol: string,
    exchange: string,
    bid: number,
    ask: number
  ) => {
    const key = `${symbol}::${exchange}`;
    price.set(key, { bid, ask });
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
