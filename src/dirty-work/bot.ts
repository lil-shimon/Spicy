import { connectCoinw } from '../clients/coinw/coinw-ws';
import { calculateSpreadRate } from './spread';

const spreadThreshold = 0.1; // スプレッドの閾値を設定

const handleUpdate = (bestBid: number, bestAsk: number) => {
  console.log('Best Bid:', bestBid);
  console.log('Best Ask:', bestAsk);
  const spread = calculateSpreadRate(bestBid, bestAsk);
  console.log('Spread:', spread);

  if (spread > spreadThreshold) {
    console.log('Spread is above threshold, taking action...');
    // ここにアクションを追加
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
