import { ExchangeRateRepository } from './../repositories/exchange-rate.repository';
import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from '../services/arbitrage.service';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { PriceService } from '../services/price.service';

// TODO: 依存性の整理
// - PriceRepository()を一度だけインスタンス化
// - ArbitrageService({ priceRepository })でサービス作成
// - 各サービスのstart()を呼び出し
const priceRepository = PriceRepository();
const exchangeRateRepository = ExchangeRateRepository();
const arbitrageService = ArbitrageService();

const priceService = PriceService({ priceRepository, arbitrageService });
const exchangeRateService = ExchangeRateService({ exchangeRateRepository });

type ArbitrageControllerParams = {
  symbol: string;
};

export const ArbitrageController = () => {
  const start = (params: ArbitrageControllerParams) => {
    const { symbol } = params;
    exchangeRateService.start({});
    priceService.start({ symbol });
  };

  return { start } as const;
};
