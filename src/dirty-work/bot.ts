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
import { createOrderService } from './services/order-service';
import { createInventoryService } from './services/inventory-service';
import { PnLService } from './services/pnl-service';
import { calculateSpreadRate } from './spread';

const spreadThreshold = 0.1; // スプレッドの閾値を設定
const TICK = 0.0001;

let tickSize = TICK;
const orderService = createOrderService();
const inventoryService = createInventoryService();
const pnlService = new PnLService(inventoryService);
/**
 * 注文が約定せずキャンセルした回数。
 * 2回キャンセルしたら注文をできないようにする
 */
let buyCancelCount = 0;
let sellCancelCount = 0;
let completeCount = 0;

export type OnFillParams = {
  side: 'buy' | 'sell';
  price: number;
  symbol: string;
};

const handleOnFill = ({ side, price, symbol }: OnFillParams) => {
  const token = symbol.split('/')[0];
  const stable = symbol.split('/')[1];
  console.log(
    `通知：損益: ${pnlService.getPnl()}USDT, 在庫PUMP: ${inventoryService.getInventory(token)}, 在庫USDT: ${inventoryService.getInventory(stable)}`
  );
  postMMMessage(
    `通知：損益: ${pnlService.getPnl()}USDT, 在庫PUMP: ${inventoryService.getInventory(token)}, 在庫USDT: ${inventoryService.getInventory(stable)}`
  );
  writePnlCSV({
    realizedPnL: pnlService.getPnl(),
    invPump: inventoryService.getInventory(token),
    invUsdt: inventoryService.getInventory(stable),
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
    inventory: inventoryService.getInventory(symbol),
    amount,
    tickSize,
  });

  const orderPromises = [orderLimit(symbol, 'buy', amount, buyPrice, 'limit')];

  const handleSellOrderEnabled = () => {
    const token = symbol.split('/')[0];
    return inventoryService.getInventory(token) > amount;
  };

  if (handleSellOrderEnabled()) {
    orderPromises.push(orderLimit(symbol, 'sell', amount, sellPrice, 'limit'));
  }

  const orders = await Promise.all(orderPromises);

  if (orders.length) {
    orderService.addOrder(orders.filter((o) => o !== undefined));
  }

  postMMMessage(
    `[DirtyWork] 注文を出します: ${symbol} 買い${buyPrice} 売り${sellPrice}`
  );

  const buyOrderId = orderService.getOrderIdBySide('buy');
  const sellOrderId = orderService.getOrderIdBySide('sell');

  if (!buyOrderId || !sellOrderId) {
    await postMMMessage(
      `[DirtyWork] 注文作成中にエラーが発生しました?? (IDが取得できない): ${JSON.stringify(
        {
          orders,
        }
      )}`
    );
    return;
  }

  orderService.updateOrderStatus(true);

  const tStart = Date.now();
  const TIMEOUT_MS = 1000 * 6;

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
      // TODO: この場合だと毎回最終の約定の価格になるので、ちゃんとした損益計算はできていない
      // 今の価格でのPUMP保持している量のUSDT価格としては適切ですが、MMBotの利益計算としては少し微妙かも？
      pnlService.updateCurrentPrice(buyOrder?.price ?? 0);

      // TODO: priceを使うと、約定時の価格になるので、部分約定した場合価格がズレる恐れがある
      // order.argPriceを使うように変更する
      handleOnFill({
        side: 'buy',
        price: buyOrder?.price ?? 0,
        symbol,
      });
      orderService.removeOrder(buyOrderId);
    }

    if (sellOrder?.status === 'closed' && !sellOrderClosed) {
      sellOrderClosed = true;
      sellCancelCount = 0;

      handleOnFill({
        side: 'sell',
        price: sellOrder?.price ?? 0,
        symbol,
      });
      orderService.removeOrder(sellOrderId);
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
    orderService.removeOrder(buyOrderId);
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
    orderService.removeOrder(sellOrderId);
  }

  if (orderService.getOrders().length !== 0) {
    console.log(
      'なんらかのエラーで注文が残っています。なので全てキャンセルします。'
    );
    const cancelPromises = orderService.getOrders().map((o) => {
      return cancelMexcOrder(o.id, symbol);
    });
    const response = await Promise.all(cancelPromises);
    response.forEach((res) => {
      if (res?.id) {
        orderService.removeOrder(res.id);
        postMMMessage(
          `[DirtyWork] 注文を解除しました: ${symbol} ${res.id} ${res.side} ${res.status}`
        );
      }
    });
  }

  console.log('ポジションが閉じられたので、注文を解除します', symbol);
  orderService.updateOrderStatus(false);
  const token = symbol.split('/')[0];
  const stable = symbol.split('/')[1];
  pnlService.updatePnl(token, stable);
};

const handleUpdate = async (
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

  if (orderService.getOrdered()) {
    console.log('注文済みなので、何もしません', symbol);
    return;
  }

  const token = symbol.split('/')[0];
  const stable = symbol.split('/')[1];
  const promises = [
    inventoryService.updateInventory(token),
    inventoryService.updateInventory(stable),
  ];
  await Promise.all(promises);
  handleEnableOrder(bestBid, bestAsk, spread, symbol, amount);
};

const dirtyWork = async (
  symbol: string,
  amount: number,
  thresholdRate: number
) => {
  let response;
  // 注文が約定していない場合は、Orderbookを取得しない
  if (!orderService.getOrdered()) {
    response = await fetchMexcOrderbook(symbol as Pair);
  }

  const bestBid = response?.bids[0][0];
  const bestAsk = response?.asks[0][0];

  if (!bestBid || !bestAsk) {
    return;
  }

  await handleUpdate(bestBid, bestAsk, symbol, amount, thresholdRate);
};

const initialize = async (symbol: string) => {
  const token = symbol.split('/')[0];
  const stable = symbol.split('/')[1];

  const response = await fetchMexcOrderbook(symbol as Pair);
  const bestBid = response?.bids[0][0];
  if (!bestBid) {
    return;
  }

  const promises = [
    inventoryService.updateInventory(token),
    inventoryService.updateInventory(stable),
  ];
  await Promise.all(promises);
  pnlService.initialize(bestBid, token, stable);
};

export const startDirtyWork = async (
  pair: string,
  amount: number,
  thresholdRate = spreadThreshold
) => {
  console.log('MMBot start');
  const market = await mexcClient.loadMarkets();
  tickSize = market[pair]?.precision.price ?? TICK;
  console.log(`${pair} tickSize: ${tickSize}`);
  await initialize(pair);

  const interval = 1000 * 6;
  setInterval(async () => dirtyWork(pair, amount, thresholdRate), interval);
};

startDirtyWork('PUMP/USDT', 2000, 0.12);
// startDirtyWork('SOL/USDT', 0.03, 0.002);
