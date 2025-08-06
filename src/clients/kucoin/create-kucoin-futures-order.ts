import { kucoinFuturesClient } from './kucoin-client';
import { convertToFuturesSymbol } from '../../utils/symbol-converter/symbol-converter';

export const createKucoinFuturesOrder = async (
  symbol: string,
  side: 'buy' | 'sell',
  amount: number,
  price: number,
  leverage: number = 1
) => {
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
    console.error('KuCoin futures order creation failed:', error);
    throw error;
  }
};
