import { Pair } from '../../constants';
import { postOrderMessage } from '../discord/post-message';
import { cancelMexcOrder } from './cancel-mexc-order';
import { createMexcOrder, fetchMexcOrder } from './create-mexc-order';

/**
 * 注文を成行に変更する
 * @param orderId 注文ID
 * @param symbol シンボル
 * @returns 成行注文のレスポンス
 */
export const forceMexcOrderToMarket = async (
  orderId: string,
  symbol: string
) => {
  try {
    const order = await fetchMexcOrder(orderId, symbol);
    if (!order) {
      await postOrderMessage(
        `MEXCでの注文が見つかりませんでした: ${orderId} ${symbol}`
      );
      return;
    }
    const response = await cancelMexcOrder(orderId, symbol);
    if (!response) {
      await postOrderMessage(
        `キャンセルに失敗したので成行に変更できませんでした: ${orderId} ${symbol}`
      );
      return;
    }
    const marketOrder = await createMexcOrder(
      symbol as Pair,
      order.side as 'buy' | 'sell',
      order.amount
    );
    await postOrderMessage(
      `MEXCでの注文を成行に変更しました: ${JSON.stringify(marketOrder)}`
    );
    return marketOrder;
  } catch (err) {
    console.error(err);
    await postOrderMessage(
      `MEXCでの注文を成行に変更できませんでした: ${orderId} ${symbol} ${err}`
    );
  }
};
