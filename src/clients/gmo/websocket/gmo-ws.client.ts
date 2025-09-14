import { WebSocket } from 'ws';

const endpoint = 'wss://api.coin.z.com/ws/public/v1';

type Params = {
  symbol: string;
  onUpdate?: (ask: number, bid: number) => void;
  onError?: (error: Error) => void;
  onClose?: (message: string) => void;
};

export const connectGmo = (params: Params) => {
  const { symbol = 'BTC', onUpdate, onError, onClose } = params;
  const ws = new WebSocket(endpoint);

  let pingInterval: string | number | NodeJS.Timeout | undefined;

  ws.on('open', () => {
    const subscribeMessage = {
      command: 'subscribe',
      channel: 'ticker',
      symbol,
    };

    console.log('GMO WebSocket connected');
    ws.send(JSON.stringify(subscribeMessage));
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('message', message);

      const pingSecond = 1000 * 60;

      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
          console.log('GMO WebSocket ping sent');
        }
      }, pingSecond);

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
    if (pingInterval) clearInterval(pingInterval);
    onClose?.(message);
  });

  return ws;
};

connectGmo({ symbol: 'BTC' });
