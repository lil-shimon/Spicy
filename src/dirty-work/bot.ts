import { postMMMessage } from '../clients/discord/post-message';
import { fetchMexcOrder } from '../clients/mexc/create-mexc-order';
import { fetchMexcOrderbook } from '../clients/mexc/fetch-mexc-orderbook';
import { mexcClient } from '../clients/mexc/mexc-client';
import { orderLimit } from '../clients/mexc/usdc-usdt';
import { Pair } from '../constants';
import { calculateSpreadRate } from './spread';

const spreadThreshold = 0.1; // スプレッドの閾値を設定
const TICK = 0.0001;
const FULL_SPREAD = 0.0001;
const HALF = FULL_SPREAD / 2;
let tickSize = TICK;
let ordered = false;

/**
 * TICK の倍数に切り捨て
 * roundDown(99.9517)  // → 99.951
 */
const roundDown = (price: number, tick = tickSize) => {
  return Math.floor(price / tick) * tick;
};

/**
 * TICK の倍数に切り上げ
 * roundUp  (99.9517)  // → 99.952
 */
const roundUp = (price: number, tick = tickSize) => {
  return Math.ceil(price / tick) * tick;
};

const handleEnableOrder = async (
  bestBid: number,
  bestAsk: number,
  spreadRate: number,
  symbol: string,
  amount: number
) => {
  const mid = (bestBid + bestAsk) / 2;

  const buyPrice = roundDown(mid * (1 - HALF), tickSize);
  const sellPrice = roundUp(mid * (1 + HALF), tickSize);

  console.log('buyPrice', buyPrice);
  console.log('sellPrice', sellPrice);

  const [buyOrder, sellOrder] = await Promise.all([
    orderLimit(symbol, 'buy', amount, buyPrice, 'limit'),
    orderLimit(symbol, 'sell', amount, sellPrice, 'limit'),
  ]);

  console.log('buyOrder', buyOrder);
  console.log('sellOrder', sellOrder);
  const [buyOrderId, sellOrderId] = [buyOrder?.id, sellOrder?.id];

  if (!buyOrderId || !sellOrderId) {
    await postMMMessage(
      `[DirtyWork] 注文作成中にエラーが発生しました?? (IDが取得できない): ${JSON.stringify(
        {
          buyOrder,
          sellOrder,
        }
      )}`
    );
    return;
  }

  ordered = true;

  const tStart = Date.now();
  const TIMEOUT_MS = 1000 * 60;

  while (Date.now() - tStart < TIMEOUT_MS) {
    const [buyOrder, sellOrder] = await Promise.all([
      fetchMexcOrder(buyOrderId, symbol),
      fetchMexcOrder(sellOrderId, symbol),
    ]);

    console.log('buyOrder', buyOrder);
    console.log('sellOrder', sellOrder);

    if (buyOrder?.status === 'open' && sellOrder?.status === 'open') {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
};

const handleUpdate = (
  bestBid: number,
  bestAsk: number,
  symbol: string,
  amount: number
) => {
  const spread = calculateSpreadRate(bestBid, bestAsk);

  if (spread < spreadThreshold) {
    console.log(
      'スプレッドが閾値以下になったので、何もしません',
      symbol,
      spread,
      bestBid,
      bestAsk
    );
    return;
  }

  if (ordered) {
    console.log('注文済みなので、何もしません', symbol);
    return;
  }

  handleEnableOrder(bestBid, bestAsk, spread, symbol, amount);
};

const dirtyWork = async (symbol: string, amount: number) => {
  const response = await fetchMexcOrderbook(symbol as Pair);

  const bestBid = response.bids[0][0];
  const bestAsk = response.asks[0][0];

  if (!bestBid || !bestAsk) {
    return;
  }

  handleUpdate(bestBid, bestAsk, symbol, amount);
};

export const startDirtyWork = async (symbol: string, amount: number) => {
  console.log('MMBot start');
  const market = await mexcClient.loadMarkets();
  tickSize = market[symbol]?.precision.price ?? TICK;
  console.log(`${symbol} tickSize: ${tickSize}`);

  const interval = 1000 * 10;
  setInterval(async () => dirtyWork(symbol, amount), interval);
};
