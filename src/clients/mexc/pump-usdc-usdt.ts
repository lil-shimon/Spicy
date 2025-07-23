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

export const fetchUsdcUsdt = async () => {
  const ticker = await mexcClient.fetchTicker('USDC/USDT');

  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

export const run = async () => {
  const [pumpUsdc, pumpUsdt, usdcUsdt] = await Promise.all([
    fetchPumpUsdc(),
    fetchPumpUsdt(),
    fetchUsdcUsdt(),
  ]);

  if (
    !pumpUsdc.bid ||
    !pumpUsdc.ask ||
    !usdcUsdt.bid ||
    !pumpUsdt.bid ||
    !pumpUsdt.ask
  ) {
    console.log('🚨 価格情報が取得できませんでした');
    return;
  }

  // USDC → USDT 換算（保守的に bid を使う）
  const pumpUsdcBidInUsdt = pumpUsdc.bid * usdcUsdt.bid;
  const pumpUsdcAskInUsdt = pumpUsdc.ask * usdcUsdt.bid;

  // スプレッド（USDT基準）
  const spreadSellPumpUsdcBuyPumpUsdt = pumpUsdcBidInUsdt - pumpUsdt.ask;
  const spreadSellPumpUsdtBuyPumpUsdc = pumpUsdt.bid - pumpUsdcAskInUsdt;

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

  // 閾値を設定して通知/発注に繋げられる
  const threshold = 0.000001;
  if (spreadSellPumpUsdcBuyPumpUsdt > threshold) {
    console.log('💰 USDT→USDCアービトラージのチャンス！');
  }
  if (spreadSellPumpUsdtBuyPumpUsdc > threshold) {
    console.log('💰 USDC→USDTアービトラージのチャンス！');
  }
};
