import { PriceService } from '../services/price.service';

const priceService = PriceService();

type ArbitrageControllerParams = {
  symbol: string;
};

export const ArbitrageController = () => {
  const start = (params: ArbitrageControllerParams) => {
    const { symbol } = params;
    priceService.start({ symbol });
  };

  return { start } as const;
};
