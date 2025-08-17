import WebSocket from 'ws';

const ws = new WebSocket('wss://api.coin.z.com/ws/public/v1');

/**
 * Websocket subscribe message type
 */
type Message = {
  /**
   * Websocket channel name (e.g. ticker)
   */
  channel: string;
  /**
   * Websocket symbol (e.g. BTC)
   */
  symbol: string;
};

const generateSubscribeMessage = ({ symbol, channel }: Message) => {
  const message = {
    command: 'subscribe',
    channel: channel,
    symbol: symbol,
  };

  return JSON.stringify(message);
};

ws.on('open', () => {
  const message = generateSubscribeMessage({
    symbol: 'BTC',
    channel: 'ticker',
  });
  ws.send(message);
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString('utf-8'));
  console.log('GMO WebSocket message received:', message);
});
