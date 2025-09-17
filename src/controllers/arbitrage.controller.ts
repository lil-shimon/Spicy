import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from '../services/arbitrage.service';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { ExchangeRateArbitrageService } from '../services/exchange-rate-arbitrage.service';
import { PriceService } from '../services/price.service';

const priceRepository = PriceRepository();

const arbitrageService = ArbitrageService({
  priceRepository,
});
const exchangeRateArbitrageService = ExchangeRateArbitrageService({
  priceRepository,
});
const priceService = PriceService({
  priceRepository,
  arbitrageService,
  exchangeRateArbitrageService,
});
const exchangeRateService = ExchangeRateService({ priceRepository });
export const ArbitrageController = () => {
  const start = ({ pairs }: { pairs?: string[] }) => {
    priceService.start({ pairs });
  };

  const exchangeRateArbitrageStart = () => {
    exchangeRateService.start();
    priceService.exchangeRateArbitrageStart({});
  };

  return { start, exchangeRateArbitrageStart } as const;
};
