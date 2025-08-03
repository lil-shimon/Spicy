import { kucoinClient } from './kucoin-client';

export const fetchKucoinOHLCV = async (
  symbol: string,
  timeframe: string,
  limit: number
) => {
  try {
    return await kucoinClient.fetchOHLCV(symbol, timeframe, undefined, limit);
  } catch (error) {
    console.error('Error fetching Kucoin OHLCV:', error);
  }
};
