import WebSocket from 'ws';
import { generateSubscribeMessage } from './generate-subscribe-message';

const ws = new WebSocket('wss://api.coin.z.com/ws/public/v1');

type GmoWebSocketClientParams = {
  symbol: string;
  onUpdate: (bid: number, ask: number) => {};
};

export const gmoWebSocketClient = (params: GmoWebSocketClientParams) => {
  const { symbol, onUpdate } = params;

  ws.on('open', () => {
    const message = generateSubscribeMessage({
      symbol,
      channel: 'ticker',
    });
    ws.send(message);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString('utf-8'));
    const bid = message?.bid;
    const ask = message?.ask;

    console.log('GMO WebSocket message received:', message);
    console.log('bid: ', bid);
    console.log('ask: ', ask);

    if (bid && ask) {
      onUpdate(bid, ask);
    }
  });

  ws.on('error', (error) => {
    console.error('GMO WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('GMO WebSocket connection closed');
  });
};
