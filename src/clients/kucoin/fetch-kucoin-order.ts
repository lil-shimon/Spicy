import { kucoinFuturesClient } from './kucoin-client';
import { convertToFuturesSymbol } from '../../utils/symbol-converter/symbol-converter';
import type { Order } from 'ccxt';

/**
 * KuCoin Futures の注文情報を取得します
 */
export const fetchKucoinFuturesOrder = async (
  orderId: string,
  symbol: string
): Promise<Order> => {
  try {
    const futuresSymbol = convertToFuturesSymbol(symbol);
    const order = await kucoinFuturesClient.fetchOrder(orderId, futuresSymbol);
    return order as Order;
  } catch (error) {
    console.error('KuCoin先物注文の取得に失敗しました:', error);
    throw error;
  }
};
