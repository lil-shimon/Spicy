import { kucoinFuturesClient } from './kucoin-client';
import { convertToFuturesSymbol } from '../../utils/symbol-converter/symbol-converter';

export const createKucoinFuturesOrder = async (
  symbol: string,
  side: 'buy' | 'sell',
  amount: number,
  price: number,
  leverage: number = 1
) => {
  // パラメータバリデーション
  if (amount <= 0) {
    throw new Error('注文量は0より大きい値である必要があります');
  }

  if (price <= 0) {
    throw new Error('価格は0より大きい値である必要があります');
  }

  // レバレッジの範囲チェック（暫定的に1-20、TODO: 正確な最大値を調査）
  if (leverage < 1 || leverage > 20) {
    throw new Error('レバレッジは1から20の間である必要があります');
  }

  try {
    const futuresSymbol = convertToFuturesSymbol(symbol);

    const order = await kucoinFuturesClient.createOrder(
      futuresSymbol,
      'limit',
      side,
      amount,
      price,
      {
        leverage,
      }
    );

    return order;
  } catch (error) {
    console.error('KuCoin先物注文の作成に失敗しました:', error);
    throw error;
  }
};
