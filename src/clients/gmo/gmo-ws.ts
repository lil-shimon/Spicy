import WebSocket from 'ws';
import { generateSubscribeMessage } from './generate-subscribe-message';

const ws = new WebSocket('wss://api.coin.z.com/ws/public/v1');

type GmoWebSocketClientParams = {
  symbol: string;
  onUpdate: (bid: number, ask: number) => void;
  onError: (error: Error) => void;
  onClose: (message: string) => void;
};

export const gmoWebSocketClient = (params: GmoWebSocketClientParams) => {
  const { symbol, onUpdate, onError, onClose } = params;

  ws.on('open', () => {
    const message = generateSubscribeMessage({
      symbol,
      channel: 'ticker',
    });
    ws.send(message);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString('utf-8'));
    const bid = message?.bid;
    const ask = message?.ask;

    if (bid && ask) {
      onUpdate(bid, ask);
    }
  });

  ws.on('error', (error) => {
    onError(error);
  });

  ws.on('close', (code, reason) => {
    const reasonText = reason ? reason.toString() : 'No reason provided';
    const message = `GMO WebSocket closed: ${code} ${reasonText}`;
    onClose(message);
  });
};
