import { WebSocket } from 'ws';

export const connectGmo = () => {
  const endpoint = '';
  const ws = new WebSocket(endpoint);

  return ws;
};
