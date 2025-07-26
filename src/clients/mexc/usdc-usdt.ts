import { mexcClient } from './mexc-client';
import { postMessage, postOrderMessage } from '../discord/post-message';

export const fetchAskBid = async (symbol: string) => {
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

export const calcSpreadRate = (buyPrice: number, sellPrice: number) => {
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

const runBySymbol = async (
  symbol: string,
  usdcUsdt: { bid: number; ask: number },
  amount: number,
  threshold: number = 0.1
) => {
  const [usdc, usdt] = await Promise.all([
    fetchAskBid(`${symbol}/USDC`),
    fetchAskBid(`${symbol}/USDT`),
  ]);

  if (!usdc?.bid || !usdc?.ask || !usdt?.bid || !usdt?.ask) {
    console.log(`🚨 価格情報が取得できませんでした: ${symbol}`);
    return;
  }

  const usdcBidInUsdt = usdc.bid * usdcUsdt.bid;
  const usdcAskInUsdt = usdc.ask * usdcUsdt.ask;

  const spreadSellUsdcBuyUsdt = calcSpreadRate(usdt.ask, usdcBidInUsdt);
  const spreadSellUsdtBuyUsdc = calcSpreadRate(usdcAskInUsdt, usdt.bid);

  console.log(
    `${symbol}`,
    {
      bidInUsdt: usdcBidInUsdt,
      askInUsdt: usdcAskInUsdt,
    },
    `${symbol}/USDT`,
    {
      bid: usdt.bid,
      ask: usdt.ask,
    }
  );

  console.log(
    `スプレッド（${symbol}をUSDTで買ってUSDCで売る）:`,
    spreadSellUsdcBuyUsdt
  );

  console.log(
    `スプレッド（${symbol}をUSDCで買ってUSDTで売る）:`,
    spreadSellUsdtBuyUsdc
  );

  await executeBestArbitrageOpportunity(
    [
      {
        spread: spreadSellUsdcBuyUsdt,
        message: `💰 USDT→USDCアービトラージのチャンス！`,
        orders: [
          {
            symbol: `${symbol}/USDT`,
            side: 'buy',
            amount,
            price: usdt.ask,
          },
          {
            symbol: `${symbol}/USDC`,
            side: 'sell',
            amount,
            price: usdc.bid,
          },
        ],
      },
    ],
    threshold
  );
};

export const orderLimit = async (
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
  try {
    const usdcUsdt = await fetchAskBid('USDC/USDT');
    if (!usdcUsdt?.ask || !usdcUsdt.bid) {
      console.log('🚨 USDC/USDT価格情報が取得できませんでした');
      return;
    }
    console.log(
      '💰 USDC/USDT価格情報が取得できました',
      usdcUsdt.bid,
      usdcUsdt.ask
    );
    const thresholdWithFee = 0.105; // 手数料を考慮したスプレッド

    // NOTE: SOLはUSDC, USDT両方とも手数料がTakerでも0
    await runBySymbol('SOL', { bid: usdcUsdt.bid, ask: usdcUsdt.ask }, 0.01);
    // NOTE: ADAはUSDTが手数料かかる(0.005%)
    await runBySymbol(
      'ADA',
      { bid: usdcUsdt.bid, ask: usdcUsdt.ask },
      5,
      thresholdWithFee
    );
    // NOTE: SUIはUSDTが手数料かかる(0.005%)
    await runBySymbol(
      'SUI',
      { bid: usdcUsdt.bid, ask: usdcUsdt.ask },
      3,
      thresholdWithFee
    );
    // NOTE: XRPはUSDC, USDT両方とも手数料がTakerでも0
    await runBySymbol('XRP', { bid: usdcUsdt.bid, ask: usdcUsdt.ask }, 3);
    // NOTE: PENGUはUSDC, USDT両方とも手数料がTakerでも0
    await runBySymbol('PENGU', { bid: usdcUsdt.bid, ask: usdcUsdt.ask }, 10);
  } catch (err) {
    console.error(err);
    await postMessage(`🚨 エラーが発生しました: ${err}`);
  }
};
