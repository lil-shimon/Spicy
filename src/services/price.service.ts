import { gmoWebSocketClient } from '../clients/gmo/gmo-ws';
import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { PriceRepository } from '../repositories/price.repository';

type PriceServiceParams = {
  symbol: string;
};

const priceRepository = PriceRepository();

export const PriceService = () => {
  const start = async (params: PriceServiceParams) => {
    const { symbol } = params;
    await Promise.all([
      gmoWebSocketClient({
        symbol,
        onUpdate: (bid, ask) => {
          priceRepository.updatePrice(symbol, 'gmo', bid, ask);
        },
      }),
      connectKucoin({
        pair: `${symbol}-USDT`,
        onUpdate: (bid, ask) => {
          priceRepository.updatePrice(symbol, 'kucoin', bid, ask);
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
