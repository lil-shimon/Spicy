type Params = {
  // BTC/USDTなどを想定
  buyBtcPair: {
    bid: number;
    ask: number;
  };
  // DOGE/BTCなどを想定
  buyTokenPair: {
    bid: number;
    ask: number;
  };
  // DOGE/USDTなどを想定
  buyStablePair: {
    bid: number;
    ask: number;
  };
};

export const calcTriangleArbitrage = (params: Params) => {
  // TODO: implement
  const { buyBtcPair, buyStablePair, buyTokenPair } = params;
};
