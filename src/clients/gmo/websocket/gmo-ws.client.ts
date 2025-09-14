import { WebSocket } from 'ws';

const endpoint = 'wss://api.coin.z.com/ws/public/v1';

export const connectGmo = () => {
  const ws = new WebSocket(endpoint);

  return ws;
};
