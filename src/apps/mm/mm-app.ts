import { connectKucoin } from '../../clients/kucoin/kucoin-ws';

type MMApp = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const PAIR = 'BTC-USDT';

const connectKucoinWS = () => {
  connectKucoin({
    pair: PAIR,
    marketType: 'spot',
    onUpdate: handleUpdate,
    onError: handleError,
    onClose: handleClose,
  });
};

const handleUpdate = (bestBid: number, bestAsk: number) => {
  console.log('update', bestBid, bestAsk);
};

const handleError = (error: Error) => {
  console.error(error);
};

const handleClose = (message: string) => {
  console.log('close message', message);
};

export const createMMApp = (): MMApp => {
  const start = async () => {
    connectKucoinWS();
  };

  const stop = async () => {
    console.log('MM Bot - Not implemented yet');
  };

  return {
    start,
    stop,
  };
};
