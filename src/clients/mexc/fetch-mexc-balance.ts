import 'dotenv/config';
import { mexcClient } from './mexc-client';

export const fetchMexcBalance = async () => {
  return await mexcClient.fetchBalance();
};
