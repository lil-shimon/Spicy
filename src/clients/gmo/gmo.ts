import 'dotenv/config';

const apiKey = process.env.GMO_API_KEY;
const secret = process.env.GMO_SECRET;

if (!apiKey || !secret) {
  console.error('GMO APIキーまたはシークレットが設定されていません。');
  throw new Error('GMO APIキーまたはシークレットが設定されていません。');
}

const endPoint = 'https://api.coin.z.com/public';
const path = '/v1/orderbooks?symbol=';

export const fetchGmoAskBid = async (symbol: string) => {
  try {
    const url = `${endPoint}${path}${symbol}`;
    const response = await fetch(url);
    const data = await response.json();
    const asks = data.data.asks;
    const bids = data.data.bids;
    const bestAsk = asks[0].price;
    const bestBid = bids[0].price;

    return {
      ask: Number(bestAsk),
      bid: Number(bestBid),
    };
  } catch (err) {
    console.error('GMO APIエラー', err);
    return null;
  }
};

export const fetchJpyUsd = async () => {
  const url = `https://forex-api.coin.z.com/public/v1/ticker`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const jpyUsd = data.data.filter(
      (item: { symbol: string }) => item.symbol === 'USD_JPY'
    );

    return {
      ask: Number(jpyUsd[0].ask),
      bid: Number(jpyUsd[0].bid),
    };
  } catch (err) {
    console.error('GMO APIエラー', err);
    return null;
  }
};
