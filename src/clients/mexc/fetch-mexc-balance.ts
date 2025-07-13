import 'dotenv/config';
import { mexcClient } from './mexc-client';

export const fetchMexcBalance = async () => {
  const balance = await mexcClient.fetchBalance();
  console.log('MEXC Balance:', balance);
};
