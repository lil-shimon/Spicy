import { kucoinFuturesClient } from './kucoin-client';

/**
 *
 * @param symbol
 * @param timeframe
 * @param limit
 * @returns [ timestamp, open, high, low, close, volume ]
 */
export const fetchKucoinOHLCV = async (
  symbol: string,
  timeframe: string,
  limit: number
) => {
  try {
    return await kucoinFuturesClient.fetchOHLCV(
      symbol,
      timeframe,
      undefined,
      limit
    );
  } catch (error) {
    console.error('Error fetching Kucoin OHLCV:', error);
  }
};
