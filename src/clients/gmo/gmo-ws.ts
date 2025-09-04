import WebSocket from 'ws';
import { generateSubscribeMessage } from './generate-subscribe-message';

type GmoWebSocketClientParams = {
  symbol: string;
  onUpdate: (bid: number, ask: number) => void;
  onError: (error: Error) => void;
  onClose: (message: string) => void;
};

/**
 * @deprecated 現状このWSクライアントは未使用。利用時にエラーハンドリングとreconnect戦略の追加を検討してください。
 */
export const gmoWebSocketClient = (
  params: GmoWebSocketClientParams
): WebSocket => {
  const { symbol, onUpdate, onError, onClose } = params;

  // WebSocketインスタンスを関数内で作成（各呼び出しで独立した接続）
  const ws = new WebSocket('wss://api.coin.z.com/ws/public/v1');

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

  return ws;
};
