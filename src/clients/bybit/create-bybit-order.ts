import { Pair } from '../../constants';
import { bybitClient } from './bybit-client';
import { postOrderMessage } from '../discord/post-message';

export const createBybitOrder = async (
  pair: Pair,
  side: 'buy' | 'sell',
  amount: number
) => {
  let order;
  try {
    order = await bybitClient.createOrder(pair, 'market', side, amount);
    console.log('Bybitでの注文作成(createOrder)に成功しました:', order);
    await postOrderMessage(
      `Bybitでの注文作成(createOrder)に成功しました: ${JSON.stringify(order)}`
    );
  } catch (error) {
    console.error(
      'Bybitでの注文作成(createOrder)にエラーが発生しました:',
      error
    );
    await postOrderMessage(
      `Bybitでの注文作成(createOrder)にエラーが発生しました: ${JSON.stringify(error)}`
    );
    throw error;
  }

  try {
    // fetchOrderだとエラーになるのでfetchClosedOrderを使用
    const response = await bybitClient.fetchOrder(order.id, pair, {
      acknowledged: true,
    });
    console.log('注文詳細:', response);
    return response;
  } catch (error) {
    console.error(
      'Bybitでの注文詳細取得(fetchClosedOrder)にエラーが発生しました:',
      error
    );
    await postOrderMessage(
      `Bybitでの注文詳細取得(fetchClosedOrder)にエラーが発生しました: ${JSON.stringify(error)}`
    );
    throw error;
  }
};
