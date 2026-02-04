import { connectKucoinWSL2 } from '../../clients/kucoin/kucoin-ws';
import { initFromSnapshot, OrderBookState } from '../../domain/mm/l2';

type MMApp = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const PAIR = 'BTC-USDT';

export const createMMApp = (): MMApp => {
  // snapshotの値を保持するstate.
  // wsで取得したsequenceとの比較で整合性を保つために使用する.
  let state: OrderBookState | null = null;

  const start = async () => {
    state = await initFromSnapshot({ pair: PAIR });
    console.log('Initial Order Book State:', state);

    // TODO: wsインスタンスを返すようにして、こちら側でmessageのlistenなどを行うようにする.
    connectKucoinWSL2({ pair: PAIR });
  };

  const stop = async () => {
    console.log('MM Bot - Not implemented yet');
  };

  return {
    start,
    stop,
  } as const;
};
