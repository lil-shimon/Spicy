import { PAIRS } from '../../constants';
import { mexcClient } from './mexc-client';

const fetchPumpUsdc = async () => {
  const ticker = await mexcClient.fetchTicker(PAIRS.PUMP_USDC);

  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

const fetchPumpUsdt = async () => {
  const ticker = await mexcClient.fetchTicker(PAIRS.PUMP_USDT);

  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

const fetchCoinWPumpUsdt = async () => {
  const ticker = await fetch(
    'https://api.coinw.com/api/v1/public?command=returnOrderBook&symbol=PUMP_USDT&size=20'
  );
  try {
    const { data } = await ticker.json();
    const { bids, asks } = data;
    const bid = bids[0][0];
    const ask = asks[0][0];
    console.log('bid', bid, 'ask', ask);

    return {
      bid,
      ask,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const fetchUsdcUsdt = async () => {
  const ticker = await mexcClient.fetchTicker('USDC/USDT');

  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

const calcSpread = (bid: number, ask: number, fee: number) => {
  return ask - bid - fee;
};

const calcFeePrice = (price: number, feeRate: number) => {
  const fee = price * feeRate;
  return price - fee;
};

export const run = async () => {
  const [pumpUsdc, pumpUsdt, usdcUsdt, coinwPumpUsdt] = await Promise.all([
    fetchPumpUsdc(),
    fetchPumpUsdt(),
    fetchUsdcUsdt(),
    fetchCoinWPumpUsdt(),
  ]);

  if (
    !pumpUsdc.bid ||
    !pumpUsdc.ask ||
    !usdcUsdt.bid ||
    !pumpUsdt.bid ||
    !pumpUsdt.ask ||
    !coinwPumpUsdt?.bid ||
    !coinwPumpUsdt?.ask
  ) {
    console.log('🚨 価格情報が取得できませんでした');
    return;
  }

  // USDC → USDT 換算（保守的に bid を使う）
  const pumpUsdcBidInUsdt = pumpUsdc.bid * usdcUsdt.bid;
  const pumpUsdcAskInUsdt = pumpUsdc.ask * usdcUsdt.bid;

  // スプレッド（USDT基準）
  const spreadSellPumpUsdcBuyPumpUsdt = calcSpread(
    pumpUsdcBidInUsdt,
    pumpUsdt.ask,
    0
  );
  const spreadSellPumpUsdtBuyPumpUsdc = calcSpread(
    pumpUsdt.bid,
    pumpUsdcAskInUsdt,
    0
  );

  const coinWFeeRate = 0.002;

  const coinWPumpUsdtAskFee = calcFeePrice(coinwPumpUsdt.ask, coinWFeeRate);
  const coinWPumpUsdtBidFee = calcFeePrice(coinwPumpUsdt.bid, coinWFeeRate);

  // スプレッド（coinw）
  const spreadSellPumpUsdcBuyPumpUsdtCoinw = calcSpread(
    pumpUsdcBidInUsdt,
    coinwPumpUsdt.ask,
    coinWPumpUsdtAskFee
  );
  const spreadSellPumpUsdtBuyPumpUsdcCoinw = calcSpread(
    coinwPumpUsdt.bid,
    pumpUsdcAskInUsdt,
    coinWPumpUsdtBidFee
  );

  const spreadSellPumpUsdtBuyPumpUsdtCoinw = calcSpread(
    pumpUsdt.bid,
    coinwPumpUsdt.ask,
    coinWPumpUsdtAskFee
  );
  const spreadBuyPumpUsdtSellPumpUsdtCoinw = calcSpread(
    coinwPumpUsdt.bid,
    pumpUsdt.ask,
    coinWPumpUsdtBidFee
  );

  console.log(
    'PUMP/USDC (USDT換算)',
    {
      bidInUsdt: pumpUsdcBidInUsdt,
      askInUsdt: pumpUsdcAskInUsdt,
    },
    'PUMP/USDT',
    {
      bid: pumpUsdt.bid,
      ask: pumpUsdt.ask,
    }
  );

  console.log(
    'スプレッド（PumpをUSDTで買ってUSDCで売る）:',
    spreadSellPumpUsdcBuyPumpUsdt
  );
  console.log(
    'スプレッド（PumpをUSDCで買ってUSDTで売る）:',
    spreadSellPumpUsdtBuyPumpUsdc
  );

  console.log(
    'スプレッド（PumpをCoinWで買ってMEXCでUSDCで売る）:',
    spreadSellPumpUsdcBuyPumpUsdtCoinw
  );
  console.log(
    'スプレッド（PumpをMEXCで買ってCoinWでUSDCで売る）:',
    spreadSellPumpUsdtBuyPumpUsdcCoinw
  );

  console.log(
    'スプレッド（PumpをCoinWで買ってMEXCでUSDTで売る）:',
    spreadSellPumpUsdtBuyPumpUsdtCoinw
  );
  console.log(
    'スプレッド（PumpをMEXCで買ってCoinWでUSDTで売る）:',
    spreadBuyPumpUsdtSellPumpUsdtCoinw
  );

  // 閾値を設定して通知/発注に繋げられる
  const threshold = 0.000001;
  if (spreadSellPumpUsdcBuyPumpUsdt > threshold) {
    console.log('💰 USDT→USDCアービトラージのチャンス！');
  }
  if (spreadSellPumpUsdtBuyPumpUsdc > threshold) {
    console.log('💰 USDC→USDTアービトラージのチャンス！');
  }
};
