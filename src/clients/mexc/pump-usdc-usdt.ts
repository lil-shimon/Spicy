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

export const fetchUsdcUsdt = async () => {
  return await fetchTicker('USDC/USDT');
};

const calcSpreadRate = (buyPrice: number, sellPrice: number) => {
  return ((sellPrice - buyPrice) / buyPrice) * 100;
};

interface ArbitrageOpportunity {
  spread: number;
  message: string;
  orders: Array<{
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
  }>;
}

const executeBestArbitrageOpportunity = async (
  opportunities: ArbitrageOpportunity[],
  threshold: number
) => {
  const profitableOpportunities = opportunities.filter(
    (op) => op.spread > threshold
  );
  if (profitableOpportunities.length === 0) return;

  const bestOpportunity = profitableOpportunities.reduce((best, current) =>
    current.spread > best.spread ? current : best
  );

  const message = `💰 ${bestOpportunity.message} スプレッド: ${bestOpportunity.spread}`;
  console.log(message);
  await Promise.all(
    bestOpportunity.orders.map((order) =>
      orderLimit(order.symbol, order.side, order.amount, order.price)
    )
  );
  await postMessage(message);
};

const runSol = async () => {
  const [solUsdc, solUsdt, usdcUsdt] = await Promise.all([
    fetchTicker('SOL/USDC'),
    fetchTicker('SOL/USDT'),
    fetchTicker('USDC/USDT'),
  ]);

  if (
    !solUsdc?.bid ||
    !solUsdc?.ask ||
    !solUsdt?.bid ||
    !solUsdt?.ask ||
    !usdcUsdt?.bid ||
    !usdcUsdt?.ask
  ) {
    console.log('🚨 価格情報が取得できませんでした');
    return;
  }

  const solUsdcBidInUsdt = solUsdc.bid * usdcUsdt.bid;
  const solUsdcAskInUsdt = solUsdc.ask * usdcUsdt.bid;

  const spreadSellSolUsdcBuySolUsdt = calcSpreadRate(
    solUsdt.ask,
    solUsdcBidInUsdt
  );

  const spreadSellSolUsdtBuySolUsdc = calcSpreadRate(
    solUsdcAskInUsdt,
    solUsdt.bid
  );

  console.log(
    'SOL/USDC',
    {
      bidInUsdt: solUsdcBidInUsdt,
      askInUsdt: solUsdcAskInUsdt,
    },
    'SOL/USDT',
    {
      bid: solUsdt.bid,
      ask: solUsdt.ask,
    }
  );

  console.log(
    'スプレッド（SOLをUSDCで買ってUSDTで売る）:',
    spreadSellSolUsdcBuySolUsdt
  );

  console.log(
    'スプレッド（SOLをUSDTで買ってUSDCで売る）:',
    spreadSellSolUsdtBuySolUsdc
  );

  const threshold = 0.1;
  const amount = 0.01;

  await executeBestArbitrageOpportunity(
    [
      {
        spread: spreadSellSolUsdcBuySolUsdt,
        message: '💰 USDT→USDCアービトラージのチャンス！',
        orders: [
          {
            symbol: 'SOL/USDT',
            side: 'buy',
            amount,
            price: solUsdt.ask,
          },
          {
            symbol: 'SOL/USDC',
            side: 'sell',
            amount,
            price: solUsdc.bid,
          },
        ],
      },
      {
        spread: spreadSellSolUsdtBuySolUsdc,
        message: '💰 USDC→USDTアービトラージのチャンス！',
        orders: [
          {
            symbol: 'SOL/USDC',
            side: 'buy',
            amount,
            price: solUsdc.ask,
          },
          {
            symbol: 'SOL/USDT',
            side: 'sell',
            amount,
            price: solUsdt.bid,
          },
        ],
      },
    ],
    threshold
  );
};

export const runPump = async () => {
  const [pumpUsdc, pumpUsdt, usdcUsdt] = await Promise.all([
    fetchTicker('PUMP/USDT'),
    fetchTicker('PUMP/USDC'),
    fetchTicker('USDC/USDT'),
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
  const spreadSellPumpUsdcBuyPumpUsdt = calcSpreadRate(
    pumpUsdt.ask,
    pumpUsdcBidInUsdt
  );
  const spreadSellPumpUsdtBuyPumpUsdc = calcSpreadRate(
    pumpUsdcAskInUsdt,
    pumpUsdt.bid
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

  const threshold = 0.1;

  await executeBestArbitrageOpportunity(
    [
      {
        spread: spreadSellPumpUsdcBuyPumpUsdt,
        message: '💰 USDT→USDCアービトラージのチャンス！',
        orders: [
          {
            symbol: 'PUMP/USDT',
            side: 'buy',
            amount: 1000,
            price: pumpUsdt.ask,
          },
          {
            symbol: 'PUMP/USDC',
            side: 'sell',
            amount: 1000,
            price: pumpUsdc.bid,
          },
        ],
      },
      {
        spread: spreadSellPumpUsdtBuyPumpUsdc,
        message: '💰 USDC→USDTアービトラージのチャンス！',
        orders: [
          {
            symbol: 'PUMP/USDC',
            side: 'buy',
            amount: 1000,
            price: pumpUsdc.ask,
          },
          {
            symbol: 'PUMP/USDT',
            side: 'sell',
            amount: 1000,
            price: pumpUsdt.bid,
          },
        ],
      },
    ],
    threshold
  );
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

export const run = async () => {
  await runPump();
  await runSol();
};
