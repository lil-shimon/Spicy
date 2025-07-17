import { Pair } from '../../constants';
import { postMessage } from '../discord/post-message';
import { mexcClient } from './mexc-client';

export const createMexcOrder = async (
  pair: Pair,
  side: 'buy' | 'sell',
  amount: number
) => {
  try {
    const order = await mexcClient.createOrder(pair, 'market', side, amount);
    console.log('MEXCでの注文が成功しました:', order);
    await postMessage(`MEXCでの注文が成功しました: ${JSON.stringify(order)}`);
    return order;
  } catch (error) {
    console.error('MEXCでの注文作成中にエラーが発生しました:', error);
    await postMessage(
      `MEXCでの注文作成中にエラーが発生しました: ${JSON.stringify(error)}`
    );
    throw error;
  }
};
