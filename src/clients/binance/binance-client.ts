import { binance } from 'ccxt';

const apiKey = process.env.BINANCE_API_KEY;
const secret = process.env.BINANCE_SECRET;

if (!apiKey || !secret) {
  console.error('Binance APIキーまたはシークレットが設定されていません。必要な環境変数が不足しています。');
  throw new Error('Binance APIキーまたはシークレットが設定されていません。');
}

export const binanceClient = new binance({
  apiKey: apiKey || '',
  secret: secret || '',
});
