import { fetchPrices } from './logic';
import { postMessage } from './clients';
import { FetchPriceResult } from './logic/fetch-price/fetch-price';
import { checkArbitrageOpportunities } from './logic/check-arbitrage-opportunities/check-arbitrage-opportunities';
import { updateCount } from './utils';
import { mexcClient } from './clients/mexc/mexc-client';

export const startBot = async () => {
  console.log('Bot起動');

  await initExchanges();
  await execute();
  const interval = 1000 * 30; // 30秒ごとに実行

  setInterval(execute, interval);
};

const execute = async () => {
  console.log('実行開始');
  const profit = await fetchPrices();

  const arbitrageOpportunities = checkArbitrageOpportunities(profit);
  if (arbitrageOpportunities.length === 0) {
    return;
  }

  const discordMessage = formatMessageForDiscord(arbitrageOpportunities);
  console.log('Discordメッセージ:', discordMessage);

  await postMessage(discordMessage);

  arbitrageOpportunities.forEach((p) => {
    updateCount(p.pair);
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
