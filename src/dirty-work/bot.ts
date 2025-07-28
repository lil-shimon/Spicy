import { connectCoinw } from '../clients/coinw/coinw-ws';
import { postMMMessage } from '../clients/discord/post-message';
import { calculateSpreadRate } from './spread';

const spreadThreshold = 0.1; // スプレッドの閾値を設定

const handleEnableOrder = async (
  bestBid: number,
  bestAsk: number,
  spreadRate: number
) => {
  const now = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  });
  const message = `[DirtyWork] スプレッドが ${spreadThreshold}% を超えました。現在のスプレッド: ${spreadRate}%, ベストビッド: ${bestBid}, ベストアスク: ${bestAsk} 時刻: ${now}`;
  // TODO: 毎回通知するとToo Many Requestsになる。
  // どのタイミングでどのようなメッセー通知通知するかを検討する
  await postMMMessage(message);
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
