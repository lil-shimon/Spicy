import WebSocket from 'ws';

const ws = new WebSocket('wss://api.coin.z.com/ws/public/v1');

ws.on('open', () => {
  console.log('GMO WebSocket connected');
});
