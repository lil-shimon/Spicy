import { fetchKucoinPositions } from '../clients/kucoin/fetch-kucoin-positions';

/**
 * 指定シンボルにオープンポジションが存在するか確認
 * @param symbol 先物シンボル (例: 'PUMPUSDTM')
 * @returns ポジションが存在する場合true
 */
export const hasOpenPosition = async (symbol: string): Promise<boolean> => {
  try {
    const positions = await fetchKucoinPositions(symbol);

    // ポジションが存在し、契約数が0でない場合true
    const hasPosition =
      positions.length > 0 && Math.abs(positions[0].contracts || 0) > 0;

    if (hasPosition) {
      console.log(`📊 Open position found for ${symbol}:`, {
        contracts: positions[0].contracts,
        side: positions[0].side,
        unrealizedPnl: positions[0].unrealizedPnl,
      });
    }

    return hasPosition;
  } catch (error) {
    console.error(`Error checking position for ${symbol}:`, error);
    throw error; // エラーを上位に伝播
  }
};
