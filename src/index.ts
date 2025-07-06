import ccxt from "ccxt";

const fetchBinance = async () => {
  const binance = new ccxt.binance();
  const ticker = await binance.fetchTicker("ADA/USDT");
  return {
    // NOTE: レスポンスがNum形になっているので、nullチェックを行う
    // もしnullの場合は0を返す
    bid: ticker.bid ?? 0,
    ask: ticker.ask ?? 0,
  };
};

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

const calculateSpread = (buyAsk: number, sellBid: number) => {
  return buyAsk - sellBid;
};

fetchPrices();