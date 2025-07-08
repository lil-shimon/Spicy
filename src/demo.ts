import { fetchMexcOrderbook } from "./clients/mexc/fetch-mexc-orderbook";
import { PAIRS } from "./constants";

const demo = () => {
  fetchMexcOrderbook(PAIRS.HNT_USDT);
};

demo();
