import { fetchPrices } from "./logic";
import { postMessage } from "./clients";

export const startBot = async () => {
  console.log("Bot起動");

  await execute();
  const interval = 1000 * 60; // 1分ごとに実行

  setInterval(execute, interval);
};

const execute = async () => {
  console.log("実行開始");
  const profit = await fetchPrices();
  await postMessage(profit.toString());
};
