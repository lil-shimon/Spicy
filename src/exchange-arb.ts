import { fetchGmoAskBid, fetchJpyUsd } from './clients/gmo/gmo';
import { fetchAskBid } from './clients/mexc/usdc-usdt';

export const exchangeArb = async () => {
  // 1. 各取引所の価格を取得 (最初はGMO, MEXC)
  const gmoSolJpy = await fetchGmoAskBid('SOL');
  const jpyUsd = await fetchJpyUsd();
  const mexcSolUsdt = await fetchAskBid('SOL/USDT');
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

  // 2. GMOはSOL/JPY, MEXCはSOL/USDT
  // 3. 為替情報を取得(JPY/USD)
  // 4. 為替情報を使って、MEXCのSOL/USDTをJPYに変換
  const gmoSolJpyBid = gmoSolJpy.bid;
  const gmoSolJpyAsk = gmoSolJpy.ask;
  const mexcSolUsdtBid = mexcSolUsdt.bid * jpyUsd.ask;
  const mexcSolUsdtAsk = mexcSolUsdt.ask * jpyUsd.bid;
  // 5. 変換後の価格をGMOのSOL/JPYと比較
  // 6. 差益があれば、注文を出す
};

exchangeArb();
