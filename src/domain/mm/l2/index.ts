import { fetchSnapshot } from '../../../clients/kucoin/snapshot/request';

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

type OrderBookState = {
  asks: Map<string, string>;
  bids: Map<string, string>;
  lastSequence: number;
};

type Params = {
  pair: string;
};

export const initFromSnapshot = async (params: Params) => {
  const { pair } = params;
  const response = await fetchSnapshot({ pair });
  console.log('initFromSnapshot response:', response);
};

export const handleL2Update = (data: OrderBookIncrement) => {
  console.log('L2 Update:', data);
};
