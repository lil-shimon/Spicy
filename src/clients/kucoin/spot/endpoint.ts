import { getSpotToken } from './token';

export const getSpotEndpoint = async () => {
  const token = await getSpotToken();
  const wsEndpoint = `wss://ws-api-spot.kucoin.com?token=${token}`;

  return wsEndpoint;
};
