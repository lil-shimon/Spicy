import 'dotenv/config';
import crypto from 'crypto';

const apiKey = process.env.GMO_API_KEY;
const secret = process.env.GMO_SECRET;
const coinApiKey = process.env.GMO_COIN_API_KEY;
const coinApiSecret = process.env.GMO_COIN_SECRET;

let accessToken = '';

if (!apiKey || !secret) {
  console.error('GMO APIキーまたはシークレットが設定されていません。');
  throw new Error('GMO APIキーまたはシークレットが設定されていません。');
}

const endPoint = 'https://api.coin.z.com/public';
const coinEndPoint = 'https://api.coin.z.com/private';
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

export const gmoAuth = async () => {
  const timestamp = Date.now().toString();
  const path = '/v1/ws-auth';
  const url = `${coinEndPoint}${path}`;
  const method = 'POST';
  const reqBody = JSON.stringify({});
  const text = timestamp + method + path + reqBody;

  if (!coinApiSecret || !coinApiKey) {
    console.error('GMO APIキーまたはシークレットが設定されていません。');
    return;
  }

  const sign = crypto
    .createHmac('sha256', coinApiSecret)
    .update(text)
    .digest('hex');

  try {
    const response = await fetch(url, {
      headers: {
        'API-KEY': coinApiKey,
        'API-TIMESTAMP': timestamp,
        'API-SIGN': sign,
      },
      method,
      body: reqBody,
    });

    const data = await response.json();
    console.log('data', data);
    accessToken = data.data;
    return accessToken;
  } catch (err) {
    console.error('GMO APIエラー', err);
    return;
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

const getSign = (
  path: string,
  method: string,
  timestamp: string,
  reqBody?: string
) => {
  if (!coinApiSecret) {
    console.error('GMO APIキーまたはシークレットが設定されていません。');
    return;
  }

  let text = timestamp + method + path;
  if (reqBody) {
    text += reqBody;
  }

  const sign = crypto
    .createHmac('sha256', coinApiSecret)
    .update(text)
    .digest('hex');
  return sign;
};

export const fetchGmoBalance = async () => {
  const path = '/v1/account/assets';
  const url = `${coinEndPoint}${path}`;
  const method = 'GET';
  const timestamp = Date.now().toString();
  const sign = getSign(path, method, timestamp);

  if (!coinApiKey || !sign) {
    console.error('GMO APIキーまたはシークレットが設定されていません。');
    return;
  }

  const response = await fetch(url, {
    headers: {
      'API-KEY': coinApiKey,
      'API-TIMESTAMP': timestamp,
      'API-SIGN': sign,
    },
    method,
  });
  const data = await response.json();
  console.log('data', data);
  return data;
};
