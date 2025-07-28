import { postMessage } from '../clients';
import { connectCoinw } from '../clients/coinw/coinw-ws';
import { calculateSpreadRate } from './spread';

const spreadThreshold = 0.1; // スプレッドの閾値を設定

const handleEnableOrder = async (
  bestBid: number,
  bestAsk: number,
  spreadRate: number
) => {
  const message = `[DirtyWork] スプレッドが ${spreadThreshold}% を超えました。現在のスプレッド: ${spreadRate}%, ベストビッド: ${bestBid}, ベストアスク: ${bestAsk}`;
  await postMessage(message);
};

const handleUpdate = (bestBid: number, bestAsk: number) => {
  console.log('Best Bid:', bestBid);
  console.log('Best Ask:', bestAsk);
  const spread = calculateSpreadRate(bestBid, bestAsk);
  console.log('Spread:', spread);

  if (spread > spreadThreshold) {
    console.log('Spread is above threshold, taking action...');
    handleEnableOrder(bestBid, bestAsk, spread);
  }
};

export const startDirtyWork = async () => {
  console.log('MMBot start');
  connectCoinw({
    onUpdate: handleUpdate,
    onError: (error) => {
      console.error('Coinw error:', error);
    },
    onClose: () => {
      console.log('Coinw connection closed');
    },
  });
};
