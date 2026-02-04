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
  asks: Map<number, number>;
  bids: Map<number, number>;
  lastSequence: number;
};

type Params = {
  pair: string;
};

export const initFromSnapshot = async (
  params: Params
): Promise<OrderBookState> => {
  const { pair } = params;
  const response = await fetchSnapshot({ pair });
  console.log('initFromSnapshot response:', response);

  const asks = new Map<number, number>();
  const bids = new Map<number, number>();

  const snapshotAsks: string[][] = response.data.asks;
  const snapshotBids: string[][] = response.data.bids;

  snapshotAsks.forEach(([priceStr, sizeStr]) => {
    const price = Number(priceStr);
    const size = Number(sizeStr);

    if (!Number.isFinite(price) || !Number.isFinite(size)) {
      return;
    }

    if (size <= 0 || price <= 0) {
      return;
    }
    asks.set(price, size);
  });

  snapshotBids.forEach(([priceStr, sizeStr]) => {
    const price = Number(priceStr);
    const size = Number(sizeStr);

    if (!Number.isFinite(price) || !Number.isFinite(size)) {
      return;
    }

    if (size <= 0 || price <= 0) {
      return;
    }
    bids.set(price, size);
  });

  const lastSequence = Number(response.data.sequence);

  return {
    asks,
    bids,
    lastSequence,
  };
};

export const handleL2Update = (data: OrderBookIncrement) => {
  console.log('L2 Update:', data);
};
