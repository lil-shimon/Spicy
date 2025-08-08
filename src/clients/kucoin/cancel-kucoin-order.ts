import { kucoinFuturesClient } from './kucoin-client';
import { convertToFuturesSymbol } from '../../utils/symbol-converter/symbol-converter';
import { postOrderMessage } from '../discord/post-message';

/**
 * KuCoin Futures の注文をキャンセルします
 */
export const cancelKucoinFuturesOrder = async (
  orderId: string,
  symbol: string
) => {
  try {
    const futuresSymbol = convertToFuturesSymbol(symbol);
    const response = await kucoinFuturesClient.cancelOrder(
      orderId,
      futuresSymbol
    );
    console.log('KuCoin先物注文をキャンセルしました:', orderId);
    return response;
  } catch (error) {
    console.error('KuCoin先物注文のキャンセルに失敗しました:', error);
    postOrderMessage(
      `KuCoin先物注文をキャンセルできませんでした: ${orderId} ${symbol} ${JSON.stringify(error)}`
    );
    return undefined;
  }
};
