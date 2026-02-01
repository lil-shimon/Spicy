import { connectKucoinWSL2 } from '../../clients/kucoin/kucoin-ws';
import { handleL2Update } from '../../domain/mm/l2';

type MMApp = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const PAIR = 'BTC-USDT';

export const createMMApp = (): MMApp => {
  const start = async () => {
    connectKucoinWSL2({ pair: PAIR, onUpdate: handleL2Update });
  };

  const stop = async () => {
    console.log('MM Bot - Not implemented yet');
  };

  return {
    start,
    stop,
  } as const;
};
