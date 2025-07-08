import { fetchPrices } from "./logic";
import { postMessage } from "./clients";
import { FetchPriceResult } from "./logic/fetch-price/fetch-price";
import { writeCountToCsv } from "./utils";
import { checkArbitrageOpportunities } from "./logic/check-arbitrage-opportunities/check-arbitrage-opportunities";

export const startBot = async () => {
  console.log("Bot起動");

  await execute();
  const interval = 1000 * 30; // 30秒ごとに実行

  setInterval(execute, interval);
};

let HntUsdtCount = 0;
let XoUsdtCount = 0;
let WldUsdtCount = 0;

const execute = async () => {
  console.log("実行開始");
  const profit = await fetchPrices();

  const hasArbitrageOpportunities = checkArbitrageOpportunities(profit);
  if (!hasArbitrageOpportunities) {
    return;
  }

  getPairCount(profit);
  console.log("HNT/USDTの出現回数:", HntUsdtCount);
  console.log("XO/USDTの出現回数:", XoUsdtCount);
  console.log("WLD/USDTの出現回数:", WldUsdtCount);

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

  // 特定のペアのカウントを更新
  if (pairsCount["HNT_USDT"]) {
    HntUsdtCount += pairsCount["HNT_USDT"];
  }
  if (pairsCount["XO_USDT"]) {
    XoUsdtCount += pairsCount["XO_USDT"];
  }
  if (pairsCount["WLD_USDT"]) {
    WldUsdtCount += pairsCount["WLD_USDT"];
  }

  writeCountToCsv();
};
