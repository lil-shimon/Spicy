import WebSocket from 'ws';
import { generateSubscribeMessage } from './generate-subscribe-message';

const ws = new WebSocket('wss://api.coin.z.com/ws/public/v1');

ws.on('open', () => {
  const message = generateSubscribeMessage({
    symbol: 'BTC',
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
});

ws.on('error', (error) => {
  console.error('GMO WebSocket error:', error);
});

ws.on('close', () => {
  console.log('GMO WebSocket connection closed');
});
