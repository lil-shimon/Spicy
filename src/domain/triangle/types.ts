export type Params = {
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
  takerFee: number;
};

export type Detail = {
  p1ask: number;
  p2ask: number;
  p3bid: number;
  takerFee: number;
  epsilon: number;
};

export type Result = {
  ok: boolean;
  usdtIn: number;
  usdtOut: number;
  roi: number;
  detail: Detail;
};
