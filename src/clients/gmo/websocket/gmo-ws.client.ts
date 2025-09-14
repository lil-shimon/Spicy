import { WebSocket } from 'ws';

const END_POINT = 'wss://api.coin.z.com/ws/public/v1';
const PING_MS = 1000 * 60;

type Params = {
  symbol: string;
  onUpdate?: (ask: number, bid: number) => void;
  onError?: (error: Error) => void;
  onClose?: (message: string) => void;
};

export const connectGmo = (params: Params) => {
  const { symbol = 'BTC', onUpdate, onError, onClose } = params;
  const ws = new WebSocket(END_POINT);

  let pingInterval: string | number | NodeJS.Timeout | undefined;

  ws.on('open', () => {
    const subscribeMessage = {
      command: 'subscribe',
      channel: 'ticker',
      symbol,
    };

    console.log('GMO WebSocket connected');
    ws.send(JSON.stringify(subscribeMessage));

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
        console.log('GMO WebSocket ping sent');
      }
    }, PING_MS);
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('message', message);
      if (message.channel === 'ticker' && message.ask && message.bid) {
        const { ask, bid } = message;
        console.log(`GMO ${symbol} - Ask: ${ask}, Bid: ${bid}`);

        onUpdate?.(ask, bid);
      }
    } catch (error) {
      console.error('Error parsing GMO WebSocket message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('GMO WebSocket error:', error);
    onError?.(error);
  });

  ws.on('close', (code, reason) => {
    const message = `GMO WebSocket closed: ${code} - ${reason.toString()}`;
    console.error(message);

    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = undefined;
    }

    onClose?.(message);
  });

  return ws;
};

connectGmo({ symbol: 'BTC' });
