import { bybit } from 'ccxt';
import 'dotenv/config';

const apiKey = process.env.BYBIT_API_KEY;
const secret = process.env.BYBIT_SECRET;

if (!apiKey || !secret) {
  console.log('api key:', apiKey);
  console.log('secret:', secret);
  console.error('Bybit APIキーまたはシークレットが設定されていません。');
  throw new Error('Bybit APIキーまたはシークレットが設定されていません。');
}

export const bybitClient = new bybit({
  apiKey: apiKey || '',
  secret: secret || '',
  options: {
    // 時間のずれを調整する
    // https://github.com/ccxt/ccxt/issues/14410
    adjustForTimeDifference: true,
  },
});
