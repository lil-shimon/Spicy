import { postMMMessage } from '../clients/discord/post-message';
import { cancelMexcOrder } from '../clients/mexc/cancel-mexc-order';
import { fetchMexcOrder } from '../clients/mexc/create-mexc-order';
import { fetchMexcOrderbook } from '../clients/mexc/fetch-mexc-orderbook';
import { mexcClient } from '../clients/mexc/mexc-client';
import { orderLimit } from '../clients/mexc/usdc-usdt';
import { Pair } from '../constants';
import { writePnlCSV } from './csv';
import { getPrices } from './logics/get-prices';
import { handleStatus } from './logics/status';
import { calculateSpreadRate } from './spread';

const spreadThreshold = 0.1; // スプレッドの閾値を設定
const TICK = 0.0001;

let tickSize = TICK;
let ordered = false;
/**
 * 注文が約定せずキャンセルした回数。
 * 2回キャンセルしたら注文をできないようにする
 */
let buyCancelCount = 0;
let sellCancelCount = 0;
let completeCount = 0;
/**
 * PUMPの残高
 */
let invPump = 0;
/**
 * USDTの残高
 */
let invUsdt = 0;

/**
 * 実現損益
 */
let realizedPnL = 0;

export type OnFillParams = {
  side: 'buy' | 'sell';
  qty: number;
  price: number;
};

const handleOnFill = ({ side, qty, price }: OnFillParams) => {
  console.log('debug', { side, qty, price });
  if (side === 'buy') {
    invPump += qty;
    invUsdt -= qty * price;
  } else {
    invPump -= qty;
    invUsdt += qty * price;
  }
  // TODO: 将来的には手数料が0％じゃないペアでも取引すると思うので、その時は手数料を引く
  realizedPnL = invUsdt;
  console.log(
    `通知：損益: ${realizedPnL}USDT, 在庫PUMP: ${invPump}, 在庫USDT: ${invUsdt}`
  );
  postMMMessage(
    `通知：損益: ${realizedPnL}USDT, 在庫PUMP: ${invPump}, 在庫USDT: ${invUsdt}`
  );
  writePnlCSV({
    realizedPnL,
    invPump,
    invUsdt,
    price,
    side,
  });
};

const handleEnableOrder = async (
  bestBid: number,
  bestAsk: number,
  spreadRate: number,
  symbol: string,
  amount: number
) => {
  if (buyCancelCount + sellCancelCount > 6) {
    console.log(
      '注文が約定せずキャンセルした回数が6回を超えたので、何もしません',
      symbol
    );
    await postMMMessage(
      `[DirtyWork] 注文が約定せずキャンセルした回数が6回を超えたので、何もしません: ${symbol}`
    );
    return;
  }

  postMMMessage(
    `[DirtyWork] スプレッドが閾値範囲を満たしているので、注文を出します: ${symbol} ${spreadRate}`
  );

  const { buyPrice, sellPrice } = getPrices({
    bestBid,
    bestAsk,
    inventory: invPump,
    amount,
    tickSize,
  });

  const orderPromises = [
    orderLimit(symbol, 'buy', amount, buyPrice, 'limit'),
    orderLimit(symbol, 'sell', amount, sellPrice, 'limit'),
  ];

  const [buyOrder, sellOrder] = await Promise.all(orderPromises);

  postMMMessage(
    `[DirtyWork] 注文を出します: ${symbol} 買い${buyPrice} 売り${sellPrice}`
  );

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
  const TIMEOUT_MS = 1000 * 10;

  let buyOrderClosed = false;
  let sellOrderClosed = false;

  while (Date.now() - tStart < TIMEOUT_MS) {
    const fetchOrderPromises = [
      fetchMexcOrder(buyOrderId, symbol),
      fetchMexcOrder(sellOrderId, symbol),
    ];
    const [buyOrder, sellOrder] = await Promise.all(fetchOrderPromises);

    const { isOpened, isClosed } = handleStatus({
      orders: [buyOrder, sellOrder],
    });
    if (isOpened) {
      console.log('まだポジションが開いているので、何もしません', symbol);
    }

    if (buyOrder?.status === 'closed' && !buyOrderClosed) {
      buyOrderClosed = true;
      buyCancelCount = 0;

      // TODO: priceを使うと、約定時の価格になるので、部分約定した場合価格がズレる恐れがある
      // order.argPriceを使うように変更する
      handleOnFill({
        side: 'buy',
        qty: buyOrder?.filled ?? 0,
        price: buyOrder?.price ?? 0,
      });
    }

    if (sellOrder?.status === 'closed' && !sellOrderClosed) {
      sellOrderClosed = true;
      sellCancelCount = 0;

      handleOnFill({
        side: 'sell',
        qty: sellOrder?.filled ?? 0,
        price: sellOrder?.price ?? 0,
      });
    }

    if (isClosed) {
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
    const response = await cancelMexcOrder(buyOrderId, symbol);
    // キャンセルできなかった場合は、何もしない(おそらく約定している)
    if (response?.id) {
      // 売り注文が約定していたら、買い注文をキャンセルした回数を増やす
      if (sellOrderClosed) {
        buyCancelCount++;
      }
      postMMMessage(
        `[DirtyWork] 買い注文を解除しました: ${symbol} ${buyOrderId} ${buyCancelCount}回目 合計${buyCancelCount + sellCancelCount}回目`
      );
    }
  }

  if (!sellOrderClosed) {
    const response = await cancelMexcOrder(sellOrderId, symbol);
    if (response?.id) {
      // 買い注文が約定していたら、売り注文をキャンセルした回数を増やす
      if (buyOrderClosed) {
        sellCancelCount++;
      }
      postMMMessage(
        `[DirtyWork] 売り注文を解除しました: ${symbol} ${sellOrderId} ${sellCancelCount}回目 合計${buyCancelCount + sellCancelCount}回目`
      );
    }
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
  // Ver1.0では、0.1~0.15%のスプレッドで注文するようにする。
  // Ver1.1(元に戻した)では0.2%以上のスプレッドで注文するようにする。
  // Ver1.2では0.15%以上のスプレッドで注文するようにする。
  if (spread < thresholdRate) {
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

startDirtyWork('PUMP/USDT', 2000, 0.12);
