import { fetchPrices } from './logic';
import { postMessage, postOrderMessage } from './clients';
import { FetchPriceResult } from './logic/fetch-price/fetch-price';
import { checkArbitrageOpportunities } from './logic/check-arbitrage-opportunities/check-arbitrage-opportunities';
import { updateCount } from './utils';
import { mexcClient } from './clients/mexc/mexc-client';
import { createOrders } from './logic/order/order';
import 'dotenv/config';
import { run as runUsdcArb } from './clients/mexc/usdc-usdt';

const enableOrder = process.env.FEATURE_FLAG_ENABLE_ORDER === 'true';

export const startBot = async () => {
  console.log('Bot起動');

  await initExchanges();
  await execute();
  const interval = 1000 * 15; // 15秒ごとに実行

  setInterval(execute, interval);
};

export const startUsdcArb = async () => {
  console.log('USDCアービトラージBot起動');
  const interval = 1000 * 15;
  setInterval(async () => {
    await runUsdcArb();
  }, interval);
};

const execute = async () => {
  console.log('実行開始');
  console.log('enableOrder:', enableOrder);
  const profit = await fetchPrices();

  const arbitrageOpportunities = checkArbitrageOpportunities(profit);
  if (arbitrageOpportunities.length === 0) {
    return;
  }

  if (enableOrder) {
    const response = await createOrders(arbitrageOpportunities);
    await postOrderMessage(
      `注文結果: 成功: ${response.successCount}, 失敗: ${response.failCount}, 結果: ${JSON.stringify(
        response.results
      )} 機会検知時の期待値: ${JSON.stringify(arbitrageOpportunities)}`
    );
  }

  const discordMessage = formatMessageForDiscord(arbitrageOpportunities);
  console.log('Discordメッセージ:', discordMessage);

  await postMessage(discordMessage);

  arbitrageOpportunities.forEach((p) => {
    updateCount(p);
  });
};

const formatMessageForDiscord = (profit: FetchPriceResult[]): string => {
  return profit
    .map(
      (p) =>
        `ペア: ${p.pair}, 取引所: ${p.from}(買い) -> ${
          p.to
        }(売り)), 利益率: ${p.profit.toFixed(2)}%`
    )
    .join('\n');
};

const initExchanges = async () => {
  console.log('取引所Clientの初期化中...');
  // TODO: 他の取引所も初期化する
  await Promise.all([mexcClient.loadMarkets()]);
  console.log('取引所Clientの初期化完了');
};
