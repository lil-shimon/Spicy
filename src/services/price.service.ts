import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from './arbitrage.service';
import { postMessage } from '../clients';
import { ALL_PAIRS, TRIANGLES } from '../domain/triangle/constant';

import { connectGmo } from '../clients/gmo/websocket/gmo-ws.client';
type PriceServiceParams = {
  priceRepository: ReturnType<typeof PriceRepository>;
  arbitrageService: ReturnType<typeof ArbitrageService>;
};

export const PriceService = (params: PriceServiceParams) => {
  const { priceRepository, arbitrageService } = params;

  // pair -> 影響を受ける triangle index の逆引き
  const index = new Map<string, number[]>();
  TRIANGLES.forEach((t, i) => {
    [t.base, t.mid, t.out].forEach((pair) => {
      const arr = index.get(pair) ?? [];
      arr.push(i);
      index.set(pair, arr);
    });
  });

  type HandleUpdateParams = {
    symbol: string;
    exchange: string;
    ask: number;
    bid: number;
  };

  const _handleUpdate = (params: HandleUpdateParams) => {
    const { symbol, exchange, ask, bid } = params;
    const hasChanged = priceRepository.updatePrice(symbol, exchange, bid, ask);

    if (!hasChanged) return false;

    const tIndexes = index.get(symbol) ?? [];

    for (const i of tIndexes) {
      const triangle = TRIANGLES[i];
      const response = arbitrageService.checkTriangleArbitrage({
        triangle: [triangle.base, triangle.mid, triangle.out],
      });

      if (response.ok) {
        const message = `三角アビトラのチャンスがありました: ${JSON.stringify(response)} ${JSON.stringify(triangle)}`;
        postMessage(message);
      }
    }
    return true;
  };

  const _handleClose = (message: string) => {
    console.log('WebSocketの接続が閉じられました:', message);
    postMessage(message);
  };

  const _handleError = (message: string) => {
    console.error('WebSocketエラー:', message);
    postMessage(message);
  };

  const start = async ({ pairs = ALL_PAIRS }: { pairs?: string[] }) => {
    const promises = pairs.map((pair) => {
      return connectKucoin({
        pair,
        onUpdate: (bid, ask) => {
          _handleUpdate({ symbol: pair, exchange: 'kucoin', bid, ask });
        },
        onError: (error) => {
          _handleError(error.message);
        },
        onClose: (message) => {
          _handleClose(message);
        },
      });
    });

    await Promise.all(promises);
  };

  /**
   * 為替アービトラージのための価格監視を開始します
   * KuCoinとGMOの両方のWebSocketを接続して、BTC価格を監視します
   *
   * @param params.kucoinSymbol - KuCoinで監視するシンボル (デフォルト: 'BTC-USDT')
   * @param params.gmoSymbol - GMOで監視するシンボル (デフォルト: 'BTC')
   */
  const exchangeRateArbitrageStart = async ({
    kucoinSymbol = 'BTC-USDT',
    gmoSymbol = 'BTC',
  }: {
    kucoinSymbol?: string;
    gmoSymbol?: string;
  } = {}) => {
    const promises = [];

    // KuCoin WebSocket接続
    promises.push(
      connectKucoin({
        pair: kucoinSymbol,
        onUpdate: (bid, ask) => {
          _handleUpdate({
            symbol: kucoinSymbol,
            exchange: 'kucoin',
            bid,
            ask,
          });
        },
        onError: (error) => {
          _handleError(`KuCoin: ${error.message}`);
        },
        onClose: (message) => {
          _handleClose(`KuCoin: ${message}`);
        },
      })
    );

    // GMO WebSocket接続
    promises.push(
      connectGmo({
        symbol: gmoSymbol,
        onUpdate: (ask, bid) => {
          _handleUpdate({
            symbol: `${gmoSymbol}_JPY`,
            exchange: 'gmo',
            bid,
            ask,
          });
        },
        onError: (error) => {
          _handleError(`GMO: ${error.message}`);
        },
        onClose: (message) => {
          _handleClose(`GMO: ${message}`);
        },
      })
    );

    await Promise.all(promises);
  };

  return {
    start,
    exchangeRateArbitrageStart,
    _handleUpdate,
    _handleClose,
    _handleError,
  } as const;
};
