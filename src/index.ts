import ccxt from "ccxt";

console.log(ccxt.exchanges);

const fetchBinance = async () => {
  const binance = new ccxt.binance();
  const ticker = await binance.fetchTicker("BTC/USDT");
  console.log(ticker);
};

fetchBinance();