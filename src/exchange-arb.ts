import { postMessage } from './clients';
import { fetchGmoAskBid, fetchJpyUsd } from './clients/gmo/gmo';
import { calcSpreadRate, fetchAskBid } from './clients/mexc/usdc-usdt';

export const exchangeArb = async () => {
  // 1. 各取引所の価格を取得 (最初はGMO, MEXC)
  // 2. GMOはSOL/JPY, MEXCはSOL/USDT
  const gmoSolJpy = await fetchGmoAskBid('SOL');
  const mexcSolUsdt = await fetchAskBid('SOL/USDT');
  // 3. 為替情報を取得(JPY/USD)
  const jpyUsd = await fetchJpyUsd();

  if (
    !gmoSolJpy ||
    !mexcSolUsdt?.ask ||
    !mexcSolUsdt?.bid ||
    !jpyUsd?.ask ||
    !jpyUsd?.bid
  ) {
    console.log('GMOまたはMEXCのデータが取得できませんでした');
    return;
  }

  // 4. 為替情報を使って、MEXCのSOL/USDTをJPYに変換
  const mexcSolUsdtBid = mexcSolUsdt.bid * jpyUsd.ask;
  const mexcSolUsdtAsk = mexcSolUsdt.ask * jpyUsd.bid;

  // 5. 変換後の価格をGMOのSOL/JPYと比較
  const gmoBuySpreadRate = calcSpreadRate(gmoSolJpy.ask, mexcSolUsdtBid);
  const gmoSellSpreadRate = calcSpreadRate(mexcSolUsdtAsk, gmoSolJpy.bid);

  console.log('スプレッド（SOLをJPYで買ってUSDTで売る）', gmoBuySpreadRate);
  console.log('スプレッド（SOLをUSDTで買ってJPYで売る）', gmoSellSpreadRate);

  // 6. 差益があるかの判定
  const threshold = 0.1;

  // 7. TODO: 差益があれば、注文を出す
  if (gmoBuySpreadRate > threshold) {
    const message = `💰 GMO買→MEXC売アービトラージのチャンス！ スプレッド: ${gmoBuySpreadRate}% `;
    console.log(message);
    await postMessage(message);
  }

  if (gmoSellSpreadRate > threshold) {
    const message = `💰 MEXC買→GMO売アービトラージのチャンス！ スプレッド: ${gmoSellSpreadRate}% `;
    console.log(message);
    await postMessage(message);
  }
};

exchangeArb();
