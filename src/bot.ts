import { fetchPrices } from "./logic";
import { postMessage } from "./clients";
import { FetchPriceResult } from "./logic/fetch-price/fetch-price";
import { checkArbitrageOpportunities } from "./logic/check-arbitrage-opportunities/check-arbitrage-opportunities";
import { writeCountToCsv } from "./utils";

export const startBot = async () => {
  console.log("Bot起動");

  await execute();
  const interval = 1000 * 30; // 30秒ごとに実行

  setInterval(execute, interval);
};

const execute = async () => {
  console.log("実行開始");
  const profit = await fetchPrices();

  const hasArbitrageOpportunities = checkArbitrageOpportunities(profit);
  if (!hasArbitrageOpportunities) {
    return;
  }

  getPairCount(profit);

  const discordMessage = formatMessageForDiscord(profit);
  console.log("Discordメッセージ:", discordMessage);

  await postMessage(discordMessage);
};

const formatMessageForDiscord = (profit: FetchPriceResult[]): string => {
  return profit
    .map(
      (p) =>
        `ペア: ${p.pair}, 取引所: ${p.from} -> ${
          p.to
        }, 利益率: ${p.profit.toFixed(2)}%`
    )
    .join("\n");
};

const getPairCount = (profit: FetchPriceResult[]) => {
  const pairs = profit.map((p) => p.pair);
  console.log("取得したペア:", pairs);
  const pairsCount = pairs.reduce((acc, pair) => {
    acc[pair] = (acc[pair] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("ペアの出現回数:", pairsCount);

  writeCountToCsv(pairsCount);
};
