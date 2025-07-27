import { postMessage } from './clients';
import { fetchGmoAskBid, fetchJpyUsd, orderGmo } from './clients/gmo/gmo';
import {
  calcSpreadRate,
  fetchAskBid,
  orderLimit,
} from './clients/mexc/usdc-usdt';

const convert = (
  priceUsdt: number,
  side: 'buy' | 'sell',
  fx: { ask: number; bid: number }
) => {
  if (side === 'buy') {
    return priceUsdt * fx.ask;
  }
  return priceUsdt * fx.bid;
};

const exchangeArb = async (
  symbol: string,
  jpyUsd: { ask: number; bid: number },
  amount: number,
  executeType: 'LIMIT' | 'MARKET' = 'LIMIT'
) => {
  // 1. 各取引所の価格を取得 (最初はGMO, MEXC)
  // 2. GMOはSOL/JPY, MEXCはSOL/USDT
  // 3. 為替情報を取得(JPY/USD)
  const [gmoJpy, mexcUsdt] = await Promise.all([
    fetchGmoAskBid(symbol),
    fetchAskBid(`${symbol}/USDT`),
  ]);

  if (!gmoJpy || !mexcUsdt?.ask || !mexcUsdt?.bid) {
    console.log('GMOまたはMEXCのデータが取得できませんでした');
    return;
  }
  // 4. 為替情報を使って、MEXCのSOL/USDTをJPYに変換
  const mexcUsdtBid = convert(mexcUsdt.bid, 'buy', jpyUsd);
  const mexcUsdtAsk = convert(mexcUsdt.ask, 'sell', jpyUsd);

  // 5. 変換後の価格をGMOのSOL/JPYと比較
  const gmoBuySpreadRate = calcSpreadRate(gmoJpy.bid, mexcUsdtAsk);
  const gmoSellSpreadRate = calcSpreadRate(mexcUsdtBid, gmoJpy.ask);

  console.log(
    `スプレッド（${symbol}をJPYで買ってUSDTで売る: GMO買 ${gmoJpy.bid} → MEXC売 ${mexcUsdtAsk}）`,
    gmoBuySpreadRate
  );
  console.log(
    `スプレッド（${symbol}をUSDTで買ってJPYで売る: MEXC買 ${mexcUsdtBid} → GMO売 ${gmoJpy.ask}）`,
    gmoSellSpreadRate
  );

  // 6. 差益があるかの判定
  const threshold = 0.2;

  const opportunities: ArbitrageOpportunity[] = [
    {
      spread: gmoBuySpreadRate,
      message: `💰 GMO買→MEXC売アービトラージのチャンス！ スプレッド: ${gmoBuySpreadRate}% GMO買 ${gmoJpy.bid} → MEXC売 ${mexcUsdt.ask} ペア: ${symbol}`,
      orders: [
        {
          symbol: symbol,
          side: 'buy',
          amount: amount,
          price: gmoJpy.bid,
          exchange: 'GMO',
        },
        {
          symbol: `${symbol}/USDT`,
          side: 'sell',
          amount: amount,
          price: mexcUsdt.ask,
          exchange: 'MEXC',
        },
      ],
    },
    {
      spread: gmoSellSpreadRate,
      message: `💰 MEXC買→GMO売アービトラージのチャンス！ スプレッド: ${gmoSellSpreadRate}% MEXC買 ${mexcUsdt.bid} → GMO売 ${gmoJpy.ask} ペア: ${symbol}`,
      orders: [
        {
          symbol: `${symbol}/USDT`,
          side: 'buy',
          amount: amount,
          price: mexcUsdt.bid,
          exchange: 'MEXC',
        },
        {
          symbol: symbol,
          side: 'sell',
          amount: amount,
          price: gmoJpy.ask,
          exchange: 'GMO',
        },
      ],
    },
  ];

  await executeBestArbitrageOpportunity(opportunities, threshold, executeType);
};

interface ArbitrageOpportunity {
  spread: number;
  message: string;
  orders: Array<{
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    exchange: 'GMO' | 'MEXC';
  }>;
}

const executeBestArbitrageOpportunity = async (
  opportunities: ArbitrageOpportunity[],
  threshold: number,
  executeType: 'LIMIT' | 'MARKET' = 'LIMIT'
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
    bestOpportunity.orders.map((order) => {
      if (order.exchange === 'GMO') {
        return orderGmo(
          order.symbol,
          order.side === 'buy' ? 'BUY' : 'SELL',
          order.amount.toString(),
          executeType,
          order.price
        );
      } else {
        return orderLimit(order.symbol, order.side, order.amount, order.price);
      }
    })
  );
  await postMessage(message);
};

export const startExchangeArbs = async () => {
  const interval = 1000 * 15;

  setInterval(async () => {
    console.log('実行開始:為替アビトラ指値');
    const jpyUsd = await fetchJpyUsd();
    if (!jpyUsd) {
      console.log('JPY/USD価格情報が取得できませんでした');
      return;
    }
    console.log('JPY/USD価格情報が取得できました', jpyUsd.ask, jpyUsd.bid);
    await Promise.all([
      exchangeArb('SOL', jpyUsd, 0.02),
      exchangeArb('XRP', jpyUsd, 200),
      exchangeArb('BTC', jpyUsd, 0.001),
      exchangeArb('ETH', jpyUsd, 0.001),
    ]);
    console.log('実行終了');
  }, interval);
};
