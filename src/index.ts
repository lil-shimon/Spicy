import { fetchPrices } from "./logic";
import { postMessage } from "./clients";

const main = async () => {
  const profit = await fetchPrices();
  await postMessage(profit.toString());
};

main();
