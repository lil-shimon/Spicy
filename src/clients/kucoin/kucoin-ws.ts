import WebSocket from 'ws';

type Props = {
  onUpdate: (bestBid: number, bestAsk: number) => void;
  onError: (error: Error, exchange?: string) => void;
  onClose: (exchange?: string) => void;
};

export const connectKucoin = async ({ onUpdate, onError, onClose }: Props) => {
  const response = await fetch('https://api.kucoin.com/api/v1/bullet-public', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  const token = data.data.token;

  const ws = new WebSocket(`wss://ws-api-spot.kucoin.com/?token=${token}`);

  const msg = {
    type: 'subscribe',
    topic: '/market/ticker:BTC-USDT',
  };

  ws.on('open', () => {
    ws.send(JSON.stringify(msg));
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    const bestAsk = message?.data?.bestAsk;
    const bestBid = message?.data?.bestBid;
    onUpdate(bestBid, bestAsk);
  });

  ws.on('error', (error) => {
    onError(error, 'Kucoin');
  });

  ws.on('close', () => {
    onClose('Kucoin');
  });
};

connectKucoin({
  onUpdate: (bestBid, bestAsk) => {
    console.log('Kucoin', bestBid, bestAsk);
  },
  onError: (error) => {
    console.error('error', error);
  },
  onClose: () => {
    console.log('close');
  },
});
