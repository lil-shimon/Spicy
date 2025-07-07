import { fetchPrices } from "./logic";
import { postMessage } from "./clients";
import { FetchPriceResult } from "./logic/fetch-price/fetch-price";

export const startBot = async () => {
  console.log("Bot起動");

  await execute();
  const interval = 1000 * 60; // 1分ごとに実行

  setInterval(execute, interval);
};

const execute = async () => {
  console.log("実行開始");
  const profit = await fetchPrices();

  const hasProfit = profit.some((p) => p.profit > 0);

  if (!hasProfit) {
    console.log("利益がないため、メッセージを送信しません。");
    return;
  }
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