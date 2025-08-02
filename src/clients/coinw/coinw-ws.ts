import WebSocket from 'ws';
import { Asks, Bids } from '../../drama/type';

const WS_URL = 'wss://ws.futurescw.com';

type Props = {
  biz: 'exchange' | 'futures';
  pairCode: string;
  type: 'depth_snapshot' | 'depth';
  onUpdate: (asks: Asks, bids: Bids) => void;
  onError: (error: Error, exchange?: string) => void;
  onClose: (exchange?: string) => void;
};

// 10秒ごとにpingを送信する
const PING_INTERVAL_MS = 10_000;

// .infoはSocket.ioのエンドポイントなので、.comを使う
// その場合は認証が必要
// https://www.coinw.com/api-doc/en/spot-trading/market/subscribe-order-book#authentication-1
export const connectCoinw = async ({
  biz,
  type,
  pairCode,
  onUpdate,
  onError,
  onClose,
}: Props) => {
  const url = biz === 'futures' ? `${WS_URL}/perpum` : WS_URL;
  const ws = new WebSocket(url);

  const subscribeMsg = {
    event: 'sub',
    params: {
      biz,
      type,
      pairCode,
    },
  };

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

    onUpdate(asks, bids);
  });

  ws.on('error', (error) => {
    onError(error, 'Coinw');
  });

  ws.on('close', () => {
    onClose('Coinw');
  });
};
