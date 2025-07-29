import {
  postMMMessage,
  postOrderMessage,
} from '../clients/discord/post-message';
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
 * 注文が約定せずキャンセルした回数。
 * 2回キャンセルしたら注文をできないようにする
 */
let cancelCount = 0;
let completeCount = 0;

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
  if (cancelCount > 2) {
    console.log(
      '注文が約定せずキャンセルした回数が2回を超えたので、何もしません',
      symbol
    );
    await postMMMessage(
      `[DirtyWork] 注文が約定せずキャンセルした回数が2回を超えたので、何もしません: ${symbol}`
    );
    return;
  }
  postMMMessage(
    `[DirtyWork] スプレッドが閾値範囲を満たしているので、注文を出します: ${symbol} ${spreadRate}`
  );

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

  let buyOrderClosed = false;
  let sellOrderClosed = false;

  while (Date.now() - tStart < TIMEOUT_MS) {
    const [buyOrder, sellOrder] = await Promise.all([
      fetchMexcOrder(buyOrderId, symbol),
      fetchMexcOrder(sellOrderId, symbol),
    ]);

    console.log('buyOrder', buyOrder);
    console.log('sellOrder', sellOrder);

    if (buyOrder?.status === 'open' || sellOrder?.status === 'open') {
      console.log('まだポジションが開いているので、何もしません', symbol);
    }

    if (buyOrder?.status === 'closed' && !buyOrderClosed) {
      buyOrderClosed = true;
    }

    if (sellOrder?.status === 'closed' && !sellOrderClosed) {
      sellOrderClosed = true;
    }

    if (buyOrder?.status === 'closed' && sellOrder?.status === 'closed') {
      completeCount++;
      await postMMMessage(
        `[DirtyWork] ポジションが閉じられたので、注文を解除します: ${symbol} ${completeCount}回目`
      );
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  // タイムアウトしたら、注文を解除する
  if (!buyOrderClosed) {
    await mexcClient.cancelOrder(buyOrderId, symbol);
    cancelCount++;
    postOrderMessage(
      `[DirtyWork] 買い注文を解除しました: ${symbol} ${buyOrderId} ${cancelCount}回目`
    );
  }

  if (!sellOrderClosed) {
    await mexcClient.cancelOrder(sellOrderId, symbol);
    cancelCount++;
    postOrderMessage(
      `[DirtyWork] 売り注文を解除しました: ${symbol} ${sellOrderId} ${cancelCount}回目`
    );
  }

  console.log('ポジションが閉じられたので、注文を解除します', symbol);
  ordered = false;
};

const handleUpdate = (
  bestBid: number,
  bestAsk: number,
  symbol: string,
  amount: number,
  thresholdRate: number
) => {
  const spread = calculateSpreadRate(bestBid, bestAsk);

  // TODO: ボラでも判断するようにしたい。
  // 例：小ボラ時：0 .08–0 .10 %
  // 中ボラ時：0 .12–0 .15 %
  // 高ボラ時：0 .20 % 以上に自動拡大
  // thresholdRateで設定するようにする。
  if (spread < 0.1 || spread > 0.15) {
    console.log(
      'スプレッドが閾値範囲を満たしていないので、何もしません',
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

const dirtyWork = async (
  symbol: string,
  amount: number,
  thresholdRate: number
) => {
  const response = await fetchMexcOrderbook(symbol as Pair);

  const bestBid = response.bids[0][0];
  const bestAsk = response.asks[0][0];

  if (!bestBid || !bestAsk) {
    return;
  }

  handleUpdate(bestBid, bestAsk, symbol, amount, thresholdRate);
};

export const startDirtyWork = async (
  symbol: string,
  amount: number,
  thresholdRate = spreadThreshold
) => {
  console.log('MMBot start');
  const market = await mexcClient.loadMarkets();
  tickSize = market[symbol]?.precision.price ?? TICK;
  console.log(`${symbol} tickSize: ${tickSize}`);

  const interval = 1000 * 10;
  setInterval(async () => dirtyWork(symbol, amount, thresholdRate), interval);
};
