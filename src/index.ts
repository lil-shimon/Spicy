import ccxt from "ccxt";

const fetchBinance = async () => {
  const binance = new ccxt.binance();
  const ticker = await binance.fetchTicker("BTC/USDT");
  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

const fetchBybit = async () => {
  const bybit = new ccxt.bybit();
  const ticker = await bybit.fetchTicker("BTC/USDT");
  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

const fetchPrices = async () => {
  const binancePrice = await fetchBinance();
  const bybitPrice = await fetchBybit();

  console.log("Binance Price:", binancePrice);
  console.log("Bybit Price:", bybitPrice);
};

fetchPrices();