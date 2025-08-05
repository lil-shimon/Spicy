// KuCoin現物シンボルから先物シンボルへの変換マッピング
// 参考: https://www.kucoin.com/futures/contracts/list
const FUTURES_SYMBOL_MAPPING: Record<string, string> = {
  // 確実にわかっているマッピング
  'BTC/USDT': 'XBTUSDTM', // BTCはXBT（ISO 4217通貨コード）として表記

  // プロジェクトで使用している通貨ペア（要確認）
  'SOL/USDT': 'SOLUSDTM',
  'XO/USDT': 'XOUSDTM',
  'PUMP/USDT': 'PUMPUSDTM',

  // 主要な通貨ペア（一般的なパターンに基づく）
  'ETH/USDT': 'ETHUSDTM',
  'DOGE/USDT': 'DOGEUSDTM',
  'XRP/USDT': 'XRPUSDTM',
};

/**
 * 現物のシンボル形式を先物のシンボル形式に変換
 * @param spotSymbol 現物シンボル (例: 'BTC/USDT')
 * @returns 先物シンボル (例: 'XBTUSDTM')
 * @throws 未対応のシンボルの場合はエラー
 */
export const convertToFuturesSymbol = (spotSymbol: string): string => {
  // 定義済みマッピングを確認
  const futuresSymbol = FUTURES_SYMBOL_MAPPING[spotSymbol];

  if (futuresSymbol) {
    return futuresSymbol;
  }

  // マッピングにない場合は、デフォルトルールを試す
  // 'ABC/USDT' -> 'ABCUSDTM' のパターン
  if (spotSymbol.includes('/USDT')) {
    const base = spotSymbol.split('/')[0];
    const defaultSymbol = base + 'USDTM';

    console.warn(
      `Symbol ${spotSymbol} not found in mapping. Using default pattern: ${defaultSymbol}. ` +
        `Please verify this symbol exists on KuCoin Futures.`
    );

    return defaultSymbol;
  }

  // サポートされていない形式
  throw new Error(
    `Unsupported spot symbol format: ${spotSymbol}. ` +
      `Expected format like 'BTC/USDT'.`
  );
};
