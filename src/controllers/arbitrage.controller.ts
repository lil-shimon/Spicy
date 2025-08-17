import { PriceService } from '../services/price.service';

const priceService = PriceService();

export const ArbitrageController = () => {
  const start = () => {
    const symbol = 'PUMP';
    priceService.start({ symbol });
  };

  return { start } as const;
};
