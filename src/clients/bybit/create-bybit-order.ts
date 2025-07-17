import { Pair } from '../../constants';
import { bybitClient } from './bybit-client';
import { postMessage } from '../discord/post-message';

export const createBybitOrder = async (
  pair: Pair,
  side: 'buy' | 'sell',
  amount: number
) => {
  try {
    const order = await bybitClient.createOrder(pair, 'market', side, amount);
    console.log('Bybitでの注文が成功しました:', order);
    await postMessage(`Bybitでの注文が成功しました: ${JSON.stringify(order)}`);

    const response = await bybitClient.fetchOrder(order.id, pair);
    console.log('注文詳細:', response);
    return response;
  } catch (error) {
    console.error('Bybitでの注文作成中にエラーが発生しました:', error);
    await postMessage(
      `Bybitでの注文作成中にエラーが発生しました: ${JSON.stringify(error)}`
    );
    throw error;
  }
};
