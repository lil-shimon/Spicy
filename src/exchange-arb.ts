import { postMessage } from './clients';
import { fetchGmoAskBid, fetchJpyUsd, orderGmo } from './clients/gmo/gmo';
import {
  calcSpreadRate,
  fetchAskBid,
  orderLimit,
} from './clients/mexc/usdc-usdt';

const convert = (
  priceUsdt: number,
  side: 'buy' | 'sell',
  fx: { ask: number; bid: number }
) => {
  if (side === 'buy') {
    return priceUsdt * fx.ask;
  }
  return priceUsdt * fx.bid;
};

const exchangeArb = async (
  symbol: string,
  jpyUsd: { ask: number; bid: number },
  amount: number
) => {
  // 1. 各取引所の価格を取得 (最初はGMO, MEXC)
  // 2. GMOはSOL/JPY, MEXCはSOL/USDT
  // 3. 為替情報を取得(JPY/USD)
  const [gmoJpy, mexcUsdt] = await Promise.all([
    fetchGmoAskBid(symbol),
    fetchAskBid(`${symbol}/USDT`),
  ]);

  if (!gmoJpy || !mexcUsdt?.ask || !mexcUsdt?.bid) {
    console.log('GMOまたはMEXCのデータが取得できませんでした');
    return;
  }
  // 4. 為替情報を使って、MEXCのSOL/USDTをJPYに変換
  const mexcSolUsdtBid = convert(mexcUsdt.bid, 'buy', jpyUsd);
  const mexcSolUsdtAsk = convert(mexcUsdt.ask, 'sell', jpyUsd);

  // 5. 変換後の価格をGMOのSOL/JPYと比較
  const gmoBuySpreadRate = calcSpreadRate(gmoJpy.bid, mexcSolUsdtAsk);
  const gmoSellSpreadRate = calcSpreadRate(mexcSolUsdtBid, gmoJpy.ask);

  console.log(
    `スプレッド（${symbol}をJPYで買ってUSDTで売る: GMO買 ${gmoJpy.bid} → MEXC売 ${mexcSolUsdtAsk}）`,
    gmoBuySpreadRate
  );
  console.log(
    `スプレッド（${symbol}をUSDTで買ってJPYで売る: MEXC買 ${mexcSolUsdtBid} → GMO売 ${gmoJpy.ask}）`,
    gmoSellSpreadRate
  );

  // 6. 差益があるかの判定
  const threshold = 0.2;

  if (gmoBuySpreadRate > threshold) {
    const message = `💰 GMO買→MEXC売アービトラージのチャンス！ スプレッド: ${gmoBuySpreadRate}% `;
    console.log(message);
    await Promise.all([
      orderGmo(symbol, 'BUY', amount.toString(), 'LIMIT', gmoJpy.bid),
      orderLimit(`${symbol}/USDT`, 'sell', amount, mexcUsdt.ask),
    ]);
    await postMessage(message);
  }

  if (gmoSellSpreadRate > threshold) {
    const message = `💰 MEXC買→GMO売アービトラージのチャンス！ スプレッド: ${gmoSellSpreadRate}% `;
    console.log(message);
    await Promise.all([
      orderLimit(`${symbol}/USDT`, 'buy', amount, mexcUsdt.bid),
      orderGmo(symbol, 'SELL', amount.toString(), 'LIMIT', gmoJpy.ask),
    ]);
    await postMessage(message);
  }
};

export const startExchangeArbs = async () => {
  const interval = 1000 * 15;

  setInterval(async () => {
    console.log('実行開始');
    const jpyUsd = await fetchJpyUsd();
    if (!jpyUsd) {
      console.log('JPY/USD価格情報が取得できませんでした');
      return;
    }
    console.log('JPY/USD価格情報が取得できました', jpyUsd.ask, jpyUsd.bid);
    await Promise.all([
      exchangeArb('SOL', jpyUsd, 0.02),
      exchangeArb('XRP', jpyUsd, 200),
    ]);
    console.log('実行終了');
  }, interval);
};
