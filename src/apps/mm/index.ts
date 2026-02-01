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

const createMMApp = (): MMApp => {
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

const main = async () => {
  const app = createMMApp();
  await app.start();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
