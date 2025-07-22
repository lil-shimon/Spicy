import { mexc } from 'ccxt';
import 'dotenv/config';

const apiKey = process.env.MEXC_API_KEY;
const secret = process.env.MEXC_SECRET;

if (!apiKey || !secret) {
  console.error('MEXC APIキーまたはシークレットが設定されていません。');
  throw new Error('MEXC APIキーまたはシークレットが設定されていません。');
}

export const mexcClient = new mexc({
  apiKey: apiKey || '',
  secret: secret || '',
});
