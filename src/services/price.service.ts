import { gmoWebSocketClient } from '../clients/gmo/gmo-ws';
import { PriceRepository } from '../repositories/price.repository';

type PriceServiceParams = {
  symbol: string;
};

const priceRepository = PriceRepository();

export const PriceService = () => {
  const start = (params: PriceServiceParams) => {
    const { symbol } = params;
    gmoWebSocketClient({
      symbol,
      onUpdate: (bid, ask) => {
        priceRepository.updatePrice(symbol, 'gmo', bid, ask);
      },
    });
  };

  return { start };
};
