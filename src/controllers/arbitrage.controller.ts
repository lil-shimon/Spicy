import { ExchangeService } from '../services/exchange.service';
import { PriceService } from '../services/price.service';

const priceService = PriceService();
const exchangeService = ExchangeService();

type ArbitrageControllerParams = {
  symbol: string;
};

export const ArbitrageController = () => {
  const start = (params: ArbitrageControllerParams) => {
    const { symbol } = params;
    exchangeService.start({});
    priceService.start({ symbol });
  };

  return { start } as const;
};
