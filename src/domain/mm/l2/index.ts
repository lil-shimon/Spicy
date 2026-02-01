// see https://www.kucoin.com/docs-new/3470068w0
export type OrderBookIncrement = {
  changes: {
    asks: string[][];
    bids: string[][];
  };
  sequenceEnd: number;
  sequenceStart: number;
  symbol: string;
  time: number;
};

export const handleL2Update = (data: OrderBookIncrement) => {
  console.log('L2 Update:', data);
};
