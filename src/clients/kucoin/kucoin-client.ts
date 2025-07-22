import { kucoin } from 'ccxt';

const apiKey = process.env.KUCOIN_API_KEY;
const secret = process.env.KUCOIN_SECRET;
const passphrase = process.env.KUCOIN_PASSPHRASE;

if (!apiKey || !secret || !passphrase) {
  console.error(
    'KuCoin APIキーまたはシークレット、パスフレーズが設定されていません。必要な環境変数が不足しています。'
  );
  throw new Error(
    'KuCoin APIキーまたはシークレット、パスフレーズが設定されていません。必要な環境変数が不足しています。'
  );
}

export const kucoinClient = new kucoin({
  apiKey,
  secret,
  password: passphrase,
});
