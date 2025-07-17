import { createBybitOrder, createMexcOrder } from '../../clients';
import { EXCHANGES, PAIRS } from '../../constants';
import { FetchPriceResult } from '../fetch-price/fetch-price';

const XO_DEFAULT_AMOUNT = 1000;

export const createOrders = async (data: FetchPriceResult[]) => {
  const promises = [];

  for (const item of data) {
    const { pair, from, to } = item;
    if (pair === PAIRS.XO_USDT) {
      if (from === EXCHANGES.BYBIT) {
        console.log(`Bybitで買い注文を作成します ${pair} `);
        const promise = createBybitOrder(pair, 'buy', XO_DEFAULT_AMOUNT);
        promises.push(promise);
      } else if (from === EXCHANGES.MEXC) {
        console.log(`MEXCで買い注文を作成します ${pair} `);
        const promise = createMexcOrder(pair, 'buy', XO_DEFAULT_AMOUNT);
        promises.push(promise);
      }
      if (to === EXCHANGES.BYBIT) {
        console.log(`Bybitで売り注文を作成します ${pair} `);
        const promise = createBybitOrder(pair, 'sell', XO_DEFAULT_AMOUNT);
        promises.push(promise);
      } else if (to === EXCHANGES.MEXC) {
        console.log(`MEXCで売り注文を作成します ${pair} `);
        const promise = createMexcOrder(pair, 'sell', XO_DEFAULT_AMOUNT);
        promises.push(promise);
      }
    }
  }

  const results = await Promise.allSettled(promises);
  const successCount = results.filter((r) => r.status === 'fulfilled').length;
  const failCount = results.length - successCount;

  results.forEach((res, idx) => {
    if (res.status === 'fulfilled') {
      console.log(`注文成功[${idx}]:`, res.value);
    } else {
      console.error(`注文失敗[${idx}]:`, res.reason);
    }
  });

  return { successCount, failCount, results };
};
