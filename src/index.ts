import { calculateSpread } from "./core";
import { fetchBinance, fetchBybit } from "./clients";

const fetchPrices = async () => {
  const binancePrice = await fetchBinance();
  const bybitPrice = await fetchBybit();

  const spread = calculateSpread(binancePrice.ask, bybitPrice.bid);

  console.log("Binance Price:", binancePrice);
  console.log("Bybit Price:", bybitPrice);
  console.log("Spread (Binance Ask - Bybit Bid):", spread);
};

fetchPrices();
