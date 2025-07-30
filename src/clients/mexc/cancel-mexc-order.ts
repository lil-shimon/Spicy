import { postOrderMessage } from '../discord/post-message';
import { mexcClient } from './mexc-client';

export const cancelMexcOrder = async (orderId: string, symbol: string) => {
  try {
    const response = await mexcClient.cancelOrder(orderId, symbol);
    return response;
  } catch (err) {
    console.error(err);
    postOrderMessage(`注文を解除できませんでした: ${orderId} ${symbol} ${err}`);
    return null;
  }
};
