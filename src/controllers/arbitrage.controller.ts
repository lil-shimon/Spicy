import { ExchangeService } from '../services/exchange.service';
import { PriceService } from '../services/price.service';

// TODO: 依存性の整理
// - PriceRepository()を一度だけインスタンス化
// - ArbitrageService({ priceRepository })でサービス作成
// - PriceService({ arbitrageService })でサービス作成
// - 各サービスのstart()を呼び出し

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
