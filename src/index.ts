import ccxt from "ccxt";
import { calculateSpread } from "./core";
import { fetchBinance } from "./clients";

const fetchBybit = async () => {
  const bybit = new ccxt.bybit();
  const ticker = await bybit.fetchTicker("ADA/USDT");
  return {
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};

const fetchPrices = async () => {
  const binancePrice = await fetchBinance();
  const bybitPrice = await fetchBybit();

  const spread = calculateSpread(binancePrice.ask, bybitPrice.bid);

  console.log("Binance Price:", binancePrice);
  console.log("Bybit Price:", bybitPrice);
  console.log("Spread (Binance Ask - Bybit Bid):", spread);
};


fetchPrices();