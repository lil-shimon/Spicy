import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from './arbitrage.service';
import { postMessage } from '../clients';
import { TRIANGLES } from '../domain/triangle/constant';

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

  const handleUpdate = (
    symbol: string,
    exchange: string,
    ask: number,
    bid: number
  ) => {
    const hasChanged = priceRepository.updatePrice(symbol, exchange, bid, ask);

    if (!hasChanged) return;

    const tIndexes = index.get(symbol) ?? [];
    console.log('handleUpdate', { symbol, tIndexes, index });
    const response = arbitrageService.checkTriangleArbitrage({
      triangle: PAIRS,
    });
    if (response.ok) {
      const message = `三角アビトラのチャンスがありました: ${JSON.stringify(response)}`;
      postMessage(message);
    }
  };

  const handleClose = (message: string) => {
    console.log('WebSocketの接続が閉じられました:', message);
    postMessage(message);
  };

  const handleError = (message: string) => {
    console.error('WebSocketエラー:', message);
    postMessage(message);
  };

  const PAIRS = ['BTC-USDT', 'DOGE-BTC', 'DOGE-USDT'];

  const start = async ({ pairs = PAIRS }: { pairs?: string[] }) => {
    const promises = pairs.map((pair) => {
      return connectKucoin({
        pair,
        onUpdate: (bid, ask) => {
          handleUpdate(pair, 'kucoin', ask, bid);
        },
        onError: (error) => {
          handleError(error.message);
        },
        onClose: (message) => {
          handleClose(message);
        },
      });
    });

    await Promise.all(promises);
  };

  return { start } as const;
};
