import { ExchangeRateRepository } from './../repositories/exchange-rate.repository';
import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from '../services/arbitrage.service';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { PriceService } from '../services/price.service';

const priceRepository = PriceRepository();
const exchangeRateRepository = ExchangeRateRepository();

const exchangeRateService = ExchangeRateService({ exchangeRateRepository });
const arbitrageService = ArbitrageService({
  exchangeRateService,
  priceRepository,
});
const priceService = PriceService({ priceRepository, arbitrageService });

export const ArbitrageController = () => {
  const start = () => {
    priceService.start({});
  };

  return { start } as const;
};
