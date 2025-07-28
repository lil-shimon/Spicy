import { Pair } from '../../constants';
import { postOrderMessage } from '../discord/post-message';
import { mexcClient } from './mexc-client';

export const createMexcOrder = async (
  pair: Pair,
  side: 'buy' | 'sell',
  amount: number
) => {
  try {
    const order = await mexcClient.createOrder(pair, 'market', side, amount);
    console.log('MEXCでの注文が成功しました:', order);
    await postOrderMessage(
      `MEXCでの注文が成功しました: ${JSON.stringify(order)}`
    );
    const response = await mexcClient.fetchOrder(order.id, pair);
    console.log('注文詳細:', response);
    return response;
  } catch (error) {
    console.error('MEXCでの注文作成中にエラーが発生しました:', error);
    await postOrderMessage(
      `MEXCでの注文作成中にエラーが発生しました: ${JSON.stringify(error)}`
    );
    throw error;
  }
};

export const fetchMexcOrder = async (orderId: string, symbol: string) => {
  try {
    const order = await mexcClient.fetchOrder(orderId, symbol);
    return order;
  } catch (err) {
    await postOrderMessage(
      `MEXCでの注文取得中にエラーが発生しました: ${JSON.stringify(err)}`
    );
  }
};
