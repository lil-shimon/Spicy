import { WebSocket } from 'ws';

const endpoint = 'wss://api.coin.z.com/ws/public/v1';

type Params = {
  symbol: string;
};

export const connectGmo = (params: Params) => {
  const { symbol = 'BTC' } = params;
  const ws = new WebSocket(endpoint);

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
      if (message.channel === 'ticker' && message.ask && message.bid) {
        const { ask, bid } = message;
        console.log(`GMO ${symbol} - Ask: ${ask}, Bid: ${bid}`);
      }
    } catch (error) {
      console.error('Error parsing GMO WebSocket message:', error);
    }
  });

  return ws;
};

connectGmo({ symbol: 'BTC' });
