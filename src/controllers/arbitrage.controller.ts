import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from '../services/arbitrage.service';
import { PriceService } from '../services/price.service';

const priceRepository = PriceRepository();

const arbitrageService = ArbitrageService({
  priceRepository,
});
const priceService = PriceService({ priceRepository, arbitrageService });

export const ArbitrageController = () => {
  const start = ({ pairs }: { pairs?: string[] }) => {
    priceService.start({ pairs });
  };

  return { start } as const;
};
