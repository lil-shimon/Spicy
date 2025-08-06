import WebSocket from 'ws';

type Props = {
  pair: string;
  marketType?: 'spot' | 'futures';
  onUpdate: (bestBid: number, bestAsk: number) => void;
  onError: (error: Error, exchange?: string) => void;
  onClose: (exchange?: string) => void;
};

/**
 * KuCoin WebSocket接続を確立してリアルタイム価格データを取得します
 *
 * @param props - 接続設定
 * @param props.pair - 取引ペア (例: 'BTC-USDT' for spot, 'XBTUSDTM' for futures)
 * @param props.marketType - マーケットタイプ ('spot' または 'futures')
 * @param props.onUpdate - 価格更新時のコールバック関数
 * @param props.onError - エラー発生時のコールバック関数
 * @param props.onClose - 接続終了時のコールバック関数
 *
 * @example
 * // Spot取引の例
 * connectKucoin({
 *   pair: 'BTC-USDT',
 *   marketType: 'spot',
 *   onUpdate: (bestBid, bestAsk) => {
 *     console.log('Kucoin Spot', bestBid, bestAsk);
 *   },
 *   onError: (error) => {
 *     console.error('Spot error', error);
 *   },
 *   onClose: () => {
 *     console.log('Spot close');
 *   },
 * });
 *
 * @example
 * // Futures取引の例
 * connectKucoin({
 *   pair: 'XBTUSDTM',
 *   marketType: 'futures',
 *   onUpdate: (bestBid, bestAsk) => {
 *     console.log('Kucoin Futures', bestBid, bestAsk);
 *   },
 *   onError: (error) => {
 *     console.error('Futures error', error);
 *   },
 *   onClose: () => {
 *     console.log('Futures close');
 *   },
 * });
 */
export const connectKucoin = async ({
  pair,
  marketType = 'spot',
  onUpdate,
  onError,
  onClose,
}: Props) => {
  const tokenEndpoint =
    marketType === 'futures'
      ? 'https://api-futures.kucoin.com/api/v1/bullet-public'
      : 'https://api.kucoin.com/api/v1/bullet-public';

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  const token = data.data.token;

  const wsEndpoint =
    marketType === 'futures'
      ? `wss://ws-api-futures.kucoin.com/?token=${token}`
      : `wss://ws-api-spot.kucoin.com/?token=${token}`;

  const ws = new WebSocket(wsEndpoint);

  const msg = {
    type: 'subscribe',
    topic:
      marketType === 'futures'
        ? `/contractMarket/tickerV2:${pair}`
        : `/market/ticker:${pair}`,
  };

  ws.on('open', () => {
    ws.send(JSON.stringify(msg));

    // futures固有のping処理（18秒間隔）
    if (marketType === 'futures') {
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 18000);

      ws.on('close', () => {
        clearInterval(pingInterval);
      });
    }
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    let bestBid, bestAsk;

    if (marketType === 'futures') {
      // Futures用のデータ構造
      bestBid = message?.data?.bestBidPrice;
      bestAsk = message?.data?.bestAskPrice;

      // 文字列の場合は数値に変換
      if (typeof bestBid === 'string') bestBid = parseFloat(bestBid);
      if (typeof bestAsk === 'string') bestAsk = parseFloat(bestAsk);
    } else {
      // Spot用のデータ構造（既存）
      bestBid = message?.data?.bestBid;
      bestAsk = message?.data?.bestAsk;
    }

    onUpdate(bestBid, bestAsk);
  });

  ws.on('error', (error) => {
    onError(error, 'Kucoin');
  });

  ws.on('close', () => {
    onClose('Kucoin');
  });

  return ws;
};
