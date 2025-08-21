import { gmoWebSocketClient } from '../clients/gmo/gmo-ws';
import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from './arbitrage.service';

// TODO: ArbitrageServiceを依存性として受け取る
// - ファクトリーのパラメータに追加
type PriceServiceStartParams = {
  symbol: string;
};

const priceRepository = PriceRepository();
const arbitrageService = ArbitrageService();

export const PriceService = () => {
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
        },
        onClose: () => {
          console.log('Kucoin close');
        },
      }),
    ]);
  };

  return { start } as const;
};
