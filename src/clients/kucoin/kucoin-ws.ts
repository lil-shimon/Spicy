import WebSocket from 'ws';

type Props = {
  pair: string;
  marketType?: 'spot' | 'futures';
  onUpdate: (bestBid: number, bestAsk: number) => void;
  onError: (error: Error, exchange?: string) => void;
  onClose: (message: string) => void;
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
 *   onClose: (message) => {
 *     console.log('Spot close:', message);
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
 *   onClose: (message) => {
 *     console.log('Futures close:', message);
 *   },
 * });
 */
export const connectKucoin = async ({
  pair,
  marketType = 'spot',
  onUpdate,
  onError,
  onClose,
}: Props): Promise<WebSocket> => {
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

  ws.on('close', (code, reason) => {
    const reasonText =
      typeof reason === 'string'
        ? reason
        : Buffer.isBuffer(reason)
          ? reason.toString()
          : '';
    const message = `Kucoin WebSocket closed: ${code} ${reasonText}`;
    onClose(message);
  });

  return ws;
};

/**
 * Kucoinのスポット取引用トークンを取得
 */
const getSpotToken = async () => {
  const tokenEndpoint = 'https://api.kucoin.com/api/v1/bullet-public';

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    throw new Error(`Failed to fetch Kucoin spot token: ${error}`);
  }
};

/**
 * このL2関数を作った背景
 *
 * 既存の`connectKucoin`関数は、ベストビッドとベストアスクの価格情報のみ
 * L2は、オーダーブックの深さ（複数の価格レベル）を取得するために実装。
 * 板の厚さを考慮した取引戦略や分析に役立つ。(mmbot)
 */
export const connectKucoinWSL2 = async () => {
  try {
    const token = await getSpotToken();
    console.log('Kucoin Spot Token:', token);
  } catch (error) {
    console.error('Error fetching Kucoin spot token:', error);
  }
};
