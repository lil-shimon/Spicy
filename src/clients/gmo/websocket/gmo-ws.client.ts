import { WebSocket } from 'ws';

const END_POINT = 'wss://api.coin.z.com/ws/public/v1';
const PING_MS = 1000 * 60;

type Params = {
  symbol?: string;
  onUpdate: (ask: number, bid: number) => void;
  onError: (error: Error, exchange?: string) => void;
  onClose: (message: string) => void;
};

export const connectGmo = async (params: Params): Promise<WebSocket> => {
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
      }
    }, PING_MS);
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.channel === 'ticker' && message.ask && message.bid) {
        const { ask, bid } = message;
        console.log(`GMO ${symbol} - Ask: ${ask}, Bid: ${bid}`);

        onUpdate(ask, bid);
      }
    } catch (error) {
      console.error('Error parsing GMO WebSocket message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('GMO WebSocket error:', error);
    onError(error, 'GMO');
  });

  ws.on('close', (code, reason) => {
    const reasonText =
      typeof reason === 'string'
        ? reason
        : Buffer.isBuffer(reason)
          ? reason.toString()
          : '';
    const message = `GMO WebSocket closed: ${code} - ${reasonText}`;
    console.error(message);

    // 先に無効化して二重 clear を防ぐ
    const interval = pingInterval;
    pingInterval = undefined;

    if (interval) {
      clearInterval(interval);
    }

    onClose(message);
  });

  return ws;
};
