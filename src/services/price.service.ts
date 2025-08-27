import { gmoWebSocketClient } from '../clients/gmo/gmo-ws';
import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from './arbitrage.service';
import { postMessage } from '../clients';

type PriceServiceParams = {
  priceRepository: ReturnType<typeof PriceRepository>;
  arbitrageService: ReturnType<typeof ArbitrageService>;
};

type PriceServiceStartParams = {
  symbol: string;
};

export const PriceService = (params: PriceServiceParams) => {
  const { priceRepository, arbitrageService } = params;

  const handleUpdate = (
    symbol: string,
    exchange: string,
    ask: number,
    bid: number
  ) => {
    const hasChanged = priceRepository.updatePrice(symbol, exchange, bid, ask);

    if (hasChanged) {
      arbitrageService.checkBySymbol(symbol);
    }
  };

  const handleClose = (message: string) => {
    console.log('WebSocketの接続が閉じられました:', message);
    postMessage('message');
  };

  const handleError = (message: string) => {
    console.error('WebSocketエラー:', message);
    postMessage('message');
  };

  const start = async (params: PriceServiceStartParams) => {
    const { symbol } = params;
    await Promise.all([
      gmoWebSocketClient({
        symbol,
        onUpdate: (bid, ask) => {
          handleUpdate(symbol, 'gmo', ask, bid);
        },
      }),
      connectKucoin({
        pair: `${symbol}-USDT`,
        onUpdate: (bid, ask) => {
          handleUpdate(symbol, 'kucoin', ask, bid);
        },
        onError: (error) => {
          console.error('Kucoin error', error);
          const errorMessage = `Kucoin WebSocket error: ${error.message}`;
          handleError(errorMessage);
        },
        onClose: (message) => {
          handleClose(message);
        },
      }),
    ]);
  };

  return { start } as const;
};
