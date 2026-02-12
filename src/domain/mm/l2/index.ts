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

export type OrderBookState = {
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

/**
 * L2インクリメンタルchangesをオーダーブックに適用する
 * @request バッファリング後のchanges適用ロジック追加
 * @context KuCoinのchangesフォーマット: [price_string, size_string, sequence_string]
 *          size=="0" → 該当価格レベルを削除、size>"0" → 更新/追加
 */
export const applyChanges = (
  state: OrderBookState,
  changes: OrderBookIncrement['changes']
): void => {
  for (const [priceStr, sizeStr] of changes.asks) {
    const price = Number(priceStr);
    const size = Number(sizeStr);

    if (!Number.isFinite(price) || !Number.isFinite(size)) {
      continue;
    }

    if (size === 0) {
      state.asks.delete(price);
    } else {
      state.asks.set(price, size);
    }
  }

  for (const [priceStr, sizeStr] of changes.bids) {
    const price = Number(priceStr);
    const size = Number(sizeStr);

    if (!Number.isFinite(price) || !Number.isFinite(size)) {
      continue;
    }

    if (size === 0) {
      state.bids.delete(price);
    } else {
      state.bids.set(price, size);
    }
  }
};

export const handleL2Update = (
  state: OrderBookState,
  data: OrderBookIncrement
) => {
  const { sequenceStart, sequenceEnd } = data;
  console.log(
    'sequenceStart',
    sequenceStart,
    'sequenceEnd',
    sequenceEnd,
    'state.lastSequence',
    state.lastSequence
  );
};
