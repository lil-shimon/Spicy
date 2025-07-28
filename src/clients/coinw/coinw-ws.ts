import WebSocket from 'ws';

const WS_URL = 'wss://ws.futurescw.com';

const subscribeMsg = {
  event: 'sub',
  params: {
    biz: 'exchange',
    type: 'depth_snapshot',
    // BTC-USDT
    pairCode: 78,
  },
};

type Props = {
  onUpdate: (bestBid: number, bestAsk: number) => void;
  onError: (error: Error, exchange?: string) => void;
  onClose: (exchange?: string) => void;
};

// 10秒ごとにpingを送信する
const PING_INTERVAL_MS = 10_000;

// .infoはSocket.ioのエンドポイントなので、.comを使う
// その場合は認証が必要
// https://www.coinw.com/api-doc/en/spot-trading/market/subscribe-order-book#authentication-1
export const connectCoinw = async ({ onUpdate, onError, onClose }: Props) => {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('open');
    ws.send(JSON.stringify(subscribeMsg));

    setInterval(() => {
      ws.send(JSON.stringify({ event: 'ping' }));
      console.log('Ping sent');
    }, PING_INTERVAL_MS);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    const parsedData =
      typeof message.data === 'string'
        ? JSON.parse(message.data)
        : message.data;

    const asks = parsedData?.asks;
    const bids = parsedData?.bids;

    if (!asks || !bids) return;
    if (asks.length === 0 || bids.length === 0) return;

    const bestBid = parseFloat(bids[0][0]);
    const bestAsk = parseFloat(asks[0][0]);

    onUpdate(bestBid, bestAsk);
  });

  ws.on('error', (error) => {
    onError(error, 'Coinw');
  });

  ws.on('close', () => {
    onClose('Coinw');
  });
};

connectCoinw({
  onUpdate: (bestBid, bestAsk) => {
    console.log('bestBid', bestBid);
    console.log('bestAsk', bestAsk);
  },
  onError: (error) => {
    console.error('error', error);
  },
  onClose: () => {
    console.log('close');
  },
});
