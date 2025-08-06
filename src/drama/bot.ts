import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { calculateSpreadRate } from '../dirty-work/spread';
import { convertToFuturesSymbol } from '../utils/symbol-converter/symbol-converter';

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

const startDrama = () => {
  const spotSymbol = 'PUMP/USDT';
  const futuresSymbol = convertToFuturesSymbol(spotSymbol);

  connectKucoin({
    pair: futuresSymbol,
    marketType: 'futures',
    onUpdate: handleUpdate,
    onError: (error) => {
      console.error('KuCoin Futures error', error);
    },
    onClose: () => {
      console.log('KuCoin Futures closed');
    },
  });
};

startDrama();
