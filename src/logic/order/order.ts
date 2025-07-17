import { createBybitOrder, createMexcOrder } from '../../clients';
import { EXCHANGES, PAIRS } from '../../constants';
import { FetchPriceResult } from '../fetch-price/fetch-price';
import { postMessage } from '../../clients/discord/post-message';

export const createOrder = async (data: FetchPriceResult[]) => {
  const promises = [];

  for (const item of data) {
    const { pair, from, to } = item;
    if (pair === PAIRS.XO_USDT) {
      if (from === EXCHANGES.BYBIT) {
        console.log(`Bybitで買い注文を作成します ${pair} `);
        const promise = createBybitOrder(pair, 'buy', 1000);
        promises.push(promise);
        postMessage(`Bybitで買い注文を作成します ${pair} `);
      } else if (from === EXCHANGES.MEXC) {
        console.log(`MEXCで買い注文を作成します ${pair} `);
        const promise = createMexcOrder(pair, 'buy', 1000);
        promises.push(promise);
        postMessage(`MEXCで買い注文を作成します ${pair} `);
      }
      if (to === EXCHANGES.BYBIT) {
        console.log(`Bybitで売り注文を作成します ${pair} `);
        const promise = createBybitOrder(pair, 'sell', 1000);
        promises.push(promise);
        postMessage(`Bybitで売り注文を作成します ${pair} `);
      } else if (to === EXCHANGES.MEXC) {
        console.log(`MEXCで売り注文を作成します ${pair} `);
        const promise = createMexcOrder(pair, 'sell', 1000);
        promises.push(promise);
        postMessage(`MEXCで売り注文を作成します ${pair} `);
      }
    }
  }
};
