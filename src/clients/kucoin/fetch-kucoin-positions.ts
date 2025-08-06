import { kucoinFuturesClient } from './kucoin-client';

/**
 * KuCoin先物の特定シンボルのポジションを取得
 * @param symbol 先物シンボル (例: 'PUMPUSDTM')
 * @returns ポジション配列
 */
export const fetchKucoinPositions = async (symbol: string) => {
  try {
    // 特定シンボルのポジションのみ取得
    const positions = await kucoinFuturesClient.fetchPositions([symbol]);
    return positions;
  } catch (error) {
    console.error(`Failed to fetch positions for ${symbol}:`, error);
    throw error; // エラーは上位で処理
  }
};
