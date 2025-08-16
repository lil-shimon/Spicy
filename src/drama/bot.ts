import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { convertToFuturesSymbol } from '../utils/symbol-converter/symbol-converter';
import { hasOpenPosition } from './position-manager';
import { createKucoinFuturesOrder } from '../clients/kucoin/create-kucoin-futures-order';
import { fetchKucoinFuturesOrder, cancelKucoinFuturesOrder } from '../clients';
import { postMMMessage } from '../clients/discord/post-message';
import { roundDown, roundUp } from '../utils/round/round';
import WebSocket from 'ws';
import { hasProfit } from './logic/profit';
import { getMakerFeeFutures } from '../core/maker-fee/maker-fee';
import { EXCHANGES } from '../constants';

// WebSocket接続を保持する変数
let wsConnection: WebSocket | null = null;

// クリーンアップ関数
const cleanup = () => {
  if (wsConnection) {
    console.log('Closing WebSocket connection...');
    wsConnection.close();
    wsConnection = null;
  }
};

// 取引パラメータ
const SPOT_SYMBOL = 'PUMP/USDT';
const AMOUNT = 1; // 契約数
const TICK_SIZE = 0.000001; // KuCoin先物のtickSize

const handlePriceUpdate = async (
  bestBid: number,
  bestAsk: number,
  futuresSymbol: string,
  spotSymbol: string
) => {
  const isValidNumber = Number.isFinite(bestBid) && Number.isFinite(bestAsk);
  const isPositivePrice = bestBid > 0 && bestAsk > 0;
  const isValidInput = isValidNumber && isPositivePrice;

  if (!isValidInput) {
    console.warn('Invalid price data received:', { bestBid, bestAsk });
    return;
  }

  // マーケットメイカー収益性判断
  const feeRate = getMakerFeeFutures(EXCHANGES.kucoin);
  const isProfitable = hasProfit(feeRate, bestBid, bestAsk, TICK_SIZE);

  // 収益性がある場合のみ取引ロジックを実行
  if (isProfitable) {
    try {
      // ポジション確認
      const hasPosition = await hasOpenPosition(futuresSymbol);

      if (hasPosition) {
        console.log('⏸️ Position exists, skipping new orders');
        return;
      }

      // 価格計算（bestBid/bestAskベース）
      const buyPrice = roundDown(bestBid - TICK_SIZE, TICK_SIZE);
      const sellPrice = roundUp(bestAsk + TICK_SIZE, TICK_SIZE);

      console.log('📈 Placing orders:', {
        symbol: futuresSymbol,
        buyPrice: buyPrice.toFixed(6),
        sellPrice: sellPrice.toFixed(6),
        amount: AMOUNT,
      });

      // 両側同時注文
      const orders = await Promise.all([
        createKucoinFuturesOrder(spotSymbol, 'buy', AMOUNT, buyPrice),
        createKucoinFuturesOrder(spotSymbol, 'sell', AMOUNT, sellPrice),
      ]);

      console.log(
        '✅ Orders placed successfully:',
        orders.map((o) => ({
          id: o.id,
          side: o.side,
          price: o.price,
          amount: o.amount,
        }))
      );

      // Discord通知：注文作成
      await postMMMessage(
        `📋 [Drama] KuCoin先物注文作成\n` +
          `買い: ${buyPrice.toFixed(4)} USDT × ${AMOUNT}契約\n` +
          `売り: ${sellPrice.toFixed(4)} USDT × ${AMOUNT}契約\n` +
          `スプレッド: ${(((sellPrice - buyPrice) / buyPrice) * 100).toFixed(3)}%`
      );

      // 注文監視ループ（dirty-work/bot.ts:122-234を参考）
      const TIMEOUT_MS = 1000 * 10; // 10秒
      const tStart = Date.now();

      let buyOrderClosed = false;
      let sellOrderClosed = false;
      const [buyOrder, sellOrder] = orders;

      console.log('👀 Starting order monitoring (10s timeout)...');

      // 2秒ごとに注文状態をチェック
      while (Date.now() - tStart < TIMEOUT_MS) {
        // 並列で注文状態を取得
        const [buyOrderStatus, sellOrderStatus] = await Promise.all([
          fetchKucoinFuturesOrder(buyOrder.id, spotSymbol),
          fetchKucoinFuturesOrder(sellOrder.id, spotSymbol),
        ]);

        // 買い注文が約定
        if (buyOrderStatus?.status === 'closed' && !buyOrderClosed) {
          buyOrderClosed = true;
          console.log('✅ Buy order filled at:', buyOrderStatus.price);
          // Discord通知：買い注文約定
          await postMMMessage(
            `🟢 [Drama] 買い注文約定\n` +
              `価格: ${buyOrderStatus.price} USDT × ${AMOUNT}契約`
          );
        }

        // 売り注文が約定
        if (sellOrderStatus?.status === 'closed' && !sellOrderClosed) {
          sellOrderClosed = true;
          console.log('✅ Sell order filled at:', sellOrderStatus.price);
          // Discord通知：売り注文約定
          await postMMMessage(
            `🔴 [Drama] 売り注文約定\n` +
              `価格: ${sellOrderStatus.price} USDT × ${AMOUNT}契約`
          );
        }

        // 両方約定したら終了
        if (buyOrderClosed && sellOrderClosed) {
          console.log('✅ Both orders filled, position closed');
          const duration = (Date.now() - tStart) / 1000; // 秒
          // Discord通知：ラウンドトリップ完了
          await postMMMessage(
            `✅ [Drama] ラウンドトリップ完了\n` +
              `所要時間: ${duration.toFixed(1)}秒\n` +
              `買い: ${buyOrderStatus?.price} → 売り: ${sellOrderStatus?.price}`
          );
          break;
        }

        // 2秒待機
        await new Promise((resolve) => setTimeout(resolve, 2_000));
      }

      // タイムアウト処理：未約定注文をキャンセル
      if (!buyOrderClosed && buyOrder.id) {
        const result = await cancelKucoinFuturesOrder(buyOrder.id, spotSymbol);
        if (result) {
          console.log('⏱️ Buy order cancelled after timeout:', buyOrder.id);
          // Discord通知：買い注文キャンセル
          await postMMMessage(
            `⏱️ [Drama] 買い注文キャンセル\n` +
              `理由: 10秒タイムアウト\n` +
              `注文ID: ${buyOrder.id}`
          );
        }
      }

      if (!sellOrderClosed && sellOrder.id) {
        const result = await cancelKucoinFuturesOrder(sellOrder.id, spotSymbol);
        if (result) {
          console.log('⏱️ Sell order cancelled after timeout:', sellOrder.id);
          // Discord通知：売り注文キャンセル
          await postMMMessage(
            `⏱️ [Drama] 売り注文キャンセル\n` +
              `理由: 10秒タイムアウト\n` +
              `注文ID: ${sellOrder.id}`
          );
        }
      }

      console.log('📊 Order monitoring completed');

      // 片側のみ約定した場合の警告
      if (
        (buyOrderClosed && !sellOrderClosed) ||
        (!buyOrderClosed && sellOrderClosed)
      ) {
        await postMMMessage(
          `⚠️ [Drama] 片側ポジション残存\n` +
            `買い: ${buyOrderClosed ? '約定済み' : '未約定'}\n` +
            `売り: ${sellOrderClosed ? '約定済み' : '未約定'}`
        );
      }
    } catch (error) {
      console.error('❌ Error in position check or order creation:', error);
      // Discord通知：エラー
      await postMMMessage(
        `⚠️ [Drama] エラー発生\n` +
          `場所: 注文作成・ポジション確認\n` +
          `エラー: ${error instanceof Error ? error.message : String(error)}`
      );
      // エラー時は注文を実行しない
    }
  } else {
    console.log('❌ Not profitable. Waiting for better spread...');
  }
};

const startDrama = async () => {
  try {
    const futuresSymbol = convertToFuturesSymbol(SPOT_SYMBOL);

    wsConnection = await connectKucoin({
      pair: futuresSymbol,
      marketType: 'futures',
      onUpdate: (bestBid: number, bestAsk: number) =>
        handlePriceUpdate(bestBid, bestAsk, futuresSymbol, SPOT_SYMBOL),
      onError: (error) => {
        console.error('KuCoin Futures error:', error.message);
        // エラー内容を適切にサニタイズ
      },
      onClose: () => {
        console.log('KuCoin Futures closed');
      },
    });

    console.log('Drama bot started successfully');
    console.log('Configuration:', {
      symbol: futuresSymbol,
      amount: AMOUNT,
      tickSize: TICK_SIZE,
      priceStrategy: 'bestBid-1tick / bestAsk+1tick',
    });
  } catch (error) {
    console.error('Failed to start drama bot:', (error as Error).message);
    cleanup();
    process.exit(1);
  }
};

// グレースフルシャットダウンハンドラー
process.on('SIGINT', () => {
  console.log('\nShutting down drama bot...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down drama bot...');
  cleanup();
  process.exit(0);
});

// 未処理のプロミスリジェクションをキャッチ
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  cleanup();
  process.exit(1);
});

startDrama();
