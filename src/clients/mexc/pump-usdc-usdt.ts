import { PAIRS } from '../../constants';
import { mexcClient } from './mexc-client';
import { postMessage, postOrderMessage } from '../discord/post-message';

const fetchTicker = async (symbol: string) => {
  try {
    const ticker = await mexcClient.fetchTicker(symbol);
    return {
      bid: ticker.bid,
      ask: ticker.ask,
    };
  } catch (err) {
    await postMessage(`🚨 価格情報が取得できませんでした: ${symbol} ${err}`);
    return null;
  }
};

const fetchPumpUsdc = async () => {
  return await fetchTicker('PUMP/USDC');
};

const fetchPumpUsdt = async () => {
  return await fetchTicker(PAIRS.PUMP_USDT);
};

export const fetchUsdcUsdt = async () => {
  return await fetchTicker('USDC/USDT');
};

const calcSpread = (bid: number, ask: number, fee: number) => {
  return ask - bid - fee;
};

export const runPump = async () => {
  const [pumpUsdc, pumpUsdt, usdcUsdt] = await Promise.all([
    fetchPumpUsdc(),
    fetchPumpUsdt(),
    fetchUsdcUsdt(),
  ]);

  if (
    !pumpUsdc?.bid ||
    !pumpUsdc?.ask ||
    !usdcUsdt?.bid ||
    !pumpUsdt?.bid ||
    !pumpUsdt?.ask
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
  const threshold = 0.00001;
  if (spreadSellPumpUsdcBuyPumpUsdt > threshold) {
    console.log('💰 USDT→USDCアービトラージのチャンス！');
    await postMessage('💰 USDT→USDCアービトラージのチャンス！');
    await Promise.all([
      orderLimit('PUMP/USDT', 'buy', 1000, pumpUsdt.ask),
      orderLimit('PUMP/USDC', 'sell', 1000, pumpUsdc.bid),
    ]);
  }
  if (spreadSellPumpUsdtBuyPumpUsdc > threshold) {
    console.log('💰 USDC→USDTアービトラージのチャンス！');
    await postMessage('💰 USDC→USDTアービトラージのチャンス！');
    await Promise.all([
      orderLimit('PUMP/USDC', 'buy', 1000, pumpUsdc.bid),
      orderLimit('PUMP/USDT', 'sell', 1000, pumpUsdt.ask),
    ]);
  }
};

const orderLimit = async (
  symbol: string,
  side: 'buy' | 'sell',
  amount: number,
  price: number
) => {
  try {
    const response = await mexcClient.createOrder(
      symbol,
      'limit',
      side,
      amount,
      price
    );

    console.log(response);
    await postOrderMessage(
      `💰 注文を発注しました: ${symbol} ${side} ${amount} ${price}. log: ${JSON.stringify(
        response
      )}`
    );

    return response;
  } catch (err) {
    console.error(err);
    await postMessage(`🚨 注文に失敗しました: ${err}`);
  }
};
