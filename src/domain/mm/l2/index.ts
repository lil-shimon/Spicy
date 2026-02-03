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

  const asks = new Map<string, string>();
  const bids = new Map<string, string>();

  const snapshotAsks: string[][] = response.data.asks;
  const snapshotBids: string[][] = response.data.bids;

  snapshotAsks.forEach(([price, size]) => {
    asks.set(price, size);
  });

  snapshotBids.forEach(([price, size]) => {
    bids.set(price, size);
  });

  console.log('Initialized Order Book State:', { asks, bids });
};

export const handleL2Update = (data: OrderBookIncrement) => {
  console.log('L2 Update:', data);
};
