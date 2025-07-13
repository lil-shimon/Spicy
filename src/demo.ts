import { fetchBybitBalance, fetchMexcBalance } from "./clients";
import { createMexcOrder } from "./clients/mexc/create-mexc-order";
import { fetchMexcOrderbook } from "./clients/mexc/fetch-mexc-orderbook";
import { mexcClient } from "./clients/mexc/mexc-client";
import { PAIRS } from "./constants";
import { OrderBookEntry } from "./logic/slippage/calculate-buy-slippage-rate.types";
import { calculateBuySlippageRate } from "./logic/slippage/calculate-buy-slippate-rate";
import { calculateSellSlippageRate } from "./logic/slippage/calculate-sell-slippage-rate";

const demo = async () => {
  await fetchMexcBalance();
  await fetchBybitBalance();
  const response = await fetchMexcOrderbook(PAIRS.HNT_USDT);
  const slippage = calculateBuySlippageRate(
    response.asks as OrderBookEntry[],
    10
  );
  console.log("スリッページ率:", slippage);
  const sellSlippage = calculateSellSlippageRate(
    response.bids as OrderBookEntry[],
    10
  );
  console.log("売りスリッページ率:", sellSlippage);
};

const orderDemo = async () => {
  await mexcClient.loadMarkets();
  const response = await createMexcOrder(PAIRS.HNT_USDT, "buy", 10, mexcClient);
  console.log("注文結果:", response);
};

// demo();
orderDemo();
