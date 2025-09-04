import WebSocket from 'ws';

/**
 * @deprecated 現状未使用。利用時に接続先・認証方式・reconnect戦略の実装が必要です。
 */
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
