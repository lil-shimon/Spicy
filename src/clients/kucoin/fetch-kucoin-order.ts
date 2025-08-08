import { kucoinFuturesClient } from './kucoin-client';
import { convertToFuturesSymbol } from '../../utils/symbol-converter/symbol-converter';
import { postOrderMessage } from '../discord/post-message';
import type { Order } from 'ccxt';

/**
 * KuCoin Futures の注文情報を取得します
 */
export const fetchKucoinFuturesOrder = async (
  orderId: string,
  symbol: string
): Promise<Order | undefined> => {
  try {
    const futuresSymbol = convertToFuturesSymbol(symbol);
    const order = await kucoinFuturesClient.fetchOrder(orderId, futuresSymbol);
    return order;
  } catch (error) {
    console.error('KuCoin先物注文の取得に失敗しました:', error);
    await postOrderMessage(
      `KuCoin先物注文の取得に失敗しました: ${JSON.stringify(error)}`
    );
    return undefined;
  }
};
