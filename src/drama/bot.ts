import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { calculateSpreadRate } from '../dirty-work/spread';
import { convertToFuturesSymbol } from '../utils/symbol-converter/symbol-converter';
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

const handleUpdate = (bestBid: number, bestAsk: number) => {
  // 入力値のバリデーション条件を分離して定義
  const isValidNumber = Number.isFinite(bestBid) && Number.isFinite(bestAsk);
  const isPositivePrice = bestBid > 0 && bestAsk > 0;
  const isValidInput = isValidNumber && isPositivePrice;

  // 無効な入力の場合は警告を出力して早期リターン
  if (!isValidInput) {
    console.warn('Invalid price data received:', { bestBid, bestAsk });
    return;
  }

  const spreadRate = calculateSpreadRate(bestBid, bestAsk);
  console.log('spreadRate', spreadRate, 'bestBid', bestBid, 'bestAsk', bestAsk);

  // TODO: Issue #61 - マーケットメイカー収益性判断ロジックを追加
  // - 往復手数料（メイカー手数料 0.02% × 2）を考慮した実質利益計算
  // - ファンディングレート（FR）の手数料も考慮する必要あり
  // - 最小利益閾値（例: 0.01%）での収益性判断
  // 参考: calculateMarketMakerProfit関数の実装（src/drama/market-maker-profit.ts）
};

const startDrama = async () => {
  try {
    const spotSymbol = 'PUMP/USDT';
    const futuresSymbol = convertToFuturesSymbol(spotSymbol);

    wsConnection = await connectKucoin({
      pair: futuresSymbol,
      marketType: 'futures',
      onUpdate: handleUpdate,
      onError: (error) => {
        console.error('KuCoin Futures error:', error.message);
        // エラー内容を適切にサニタイズ
      },
      onClose: () => {
        console.log('KuCoin Futures closed');
      },
    });

    console.log('Drama bot started successfully');
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
