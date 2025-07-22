import WebSocket from 'ws';

// TODO: error
export const connectMexcWs = async () => {
  const ws = new WebSocket('ws://wbs-api.mexc.com/ws');

  ws.on('open', () => {
    console.log('Mexc WS connected');
  });

  ws.on('error', (error) => {
    console.error('Mexc WS error:', error);
  });

  ws.on('message', (message) => {
    console.log('Mexc WS message:', message);
  });
};
