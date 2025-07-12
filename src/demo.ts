import { fetchMexcBalance } from "./clients/mexc/fetch-mexc-balance";
import { fetchMexcOrderbook } from "./clients/mexc/fetch-mexc-orderbook";
import { PAIRS } from "./constants";
import { OrderBookEntry } from "./logic/slippage/calculate-buy-slippage-rate.types";
import { calculateBuySlippageRate } from "./logic/slippage/calculate-buy-slippate-rate";
import { calculateSellSlippageRate } from "./logic/slippage/calculate-sell-slippage-rate";

const demo = async () => {
  await fetchMexcBalance();
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

demo();
