import 'dotenv/config';
import { bybitClient } from './bybit-client';

export const fetchBybitBalance = async () => {
  const balance = await bybitClient.fetchBalance();
  console.log('bybit Balance:', balance);
};
