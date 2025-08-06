import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { calculateSpreadRate } from '../dirty-work/spread';
import { convertToFuturesSymbol } from '../utils/symbol-converter/symbol-converter';
import { calculateMarketMakerProfit } from './market-maker-profit';
import { hasOpenPosition } from './position-manager';
import { createKucoinFuturesOrder } from '../clients/kucoin/create-kucoin-futures-order';
import { roundDown, roundUp } from './round';
import WebSocket from 'ws';

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
const AMOUNT = 2; // 契約数
const TICK_SIZE = 0.0001; // KuCoin先物のtickSize（要確認）
const HALF_SPREAD = 0.00005; // 0.005%（dirty-workと同じ）

const handlePriceUpdate = async (
  bestBid: number,
  bestAsk: number,
  futuresSymbol: string,
  spotSymbol: string
) => {
  // 既存のバリデーション
  const isValidNumber = Number.isFinite(bestBid) && Number.isFinite(bestAsk);
  const isPositivePrice = bestBid > 0 && bestAsk > 0;
  const isValidInput = isValidNumber && isPositivePrice;

  if (!isValidInput) {
    console.warn('Invalid price data received:', { bestBid, bestAsk });
    return;
  }

  const spreadRate = calculateSpreadRate(bestBid, bestAsk);
  console.log('spreadRate', spreadRate, 'bestBid', bestBid, 'bestAsk', bestAsk);

  // マーケットメイカー収益性判断
  const profitAnalysis = calculateMarketMakerProfit(bestBid, bestAsk);

  console.log('Market Maker Profit Analysis:', {
    spreadRate: `${profitAnalysis.spreadRate.toFixed(4)}%`,
    roundTripFee: `${profitAnalysis.roundTripFee.toFixed(4)}%`,
    netProfit: `${profitAnalysis.netProfit.toFixed(4)}%`,
    isProfitable: profitAnalysis.isProfitable,
  });

  // 収益性がある場合のみ取引ロジックを実行
  if (profitAnalysis.isProfitable) {
    console.log(
      '✅ Profitable opportunity detected! Net profit:',
      `${profitAnalysis.netProfit.toFixed(4)}%`
    );

    try {
      // ポジション確認
      const hasPosition = await hasOpenPosition(futuresSymbol);

      if (!hasPosition) {
        // 価格計算（dirty-workロジック）
        const mid = (bestBid + bestAsk) / 2;
        const buyPrice = roundDown(mid * (1 - HALF_SPREAD), TICK_SIZE);
        const sellPrice = roundUp(mid * (1 + HALF_SPREAD), TICK_SIZE);

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
      } else {
        console.log('⏸️ Position exists, skipping new orders');
      }
    } catch (error) {
      console.error('❌ Error in position check or order creation:', error);
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
      halfSpread: `${HALF_SPREAD * 100}%`,
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
