import { kucoinFuturesClient } from './kucoin-client';

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
