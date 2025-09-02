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
  takerFee: number;
};

export const calcTriangleArbitrage = (params: Params) => {
  const { buyBtcPair, buyStablePair, buyTokenPair, takerFee } = params;

  // --- 調整したければここを変える ---
  const USDT_IN = 1; // 基準入力（1USDTで倍率を見る）
  const EPSILON = 0.001; // 安全マージン 0.1%（手数料・微スリッページ吸収）
  // -----------------------------------
};
