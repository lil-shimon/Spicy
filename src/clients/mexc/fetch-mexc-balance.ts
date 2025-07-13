import { mexc } from 'ccxt';
import 'dotenv/config';

const apiKey = process.env.MEXC_API_KEY;
const secret = process.env.MEXC_SECRET;

export const fetchMexcBalance = async () => {
  if (!apiKey || !secret) {
    console.log('api key:', apiKey);
    console.log('secret:', secret);
    console.error('MEXC APIキーまたはシークレットが設定されていません。');
    return;
  }

  const client = new mexc({
    apiKey: apiKey || '',
    secret: secret || '',
  });

  const balance = await client.fetchBalance();
  console.log('MEXC Balance:', balance);
};
