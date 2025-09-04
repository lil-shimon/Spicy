import { calcTriangleArbitrage } from '../domain/triangle';
import { PriceRepository } from './../repositories/price.repository';
import { ExchangeRateService } from './exchange-rate.service';

type ArbitrageServiceParams = {
  exchangeRateService: ReturnType<typeof ExchangeRateService>;
  priceRepository: ReturnType<typeof PriceRepository>;
};

export const ArbitrageService = (params: ArbitrageServiceParams) => {
  const { priceRepository } = params;

  type Return = {
    ok: boolean;
  };

  const checkTriangleArbitrage = (): Return => {
    // TODO propsでsymbolを受け取る
    const btcUsdt = priceRepository.getPrice('BTC-USDT', 'kucoin');
    const btcDoge = priceRepository.getPrice('DOGE-BTC', 'kucoin');
    const dogeUsdt = priceRepository.getPrice('DOGE-USDT', 'kucoin');

    if (!btcUsdt || !btcDoge || !dogeUsdt) {
      console.log('価格情報が不足しています', {
        btcUsdt,
        btcDoge,
        dogeUsdt,
      });
      return { ok: false };
    }

    // TODO: メソッド化
    const takerFee = 0.001;

    const result = calcTriangleArbitrage({
      buyBtcPair: btcUsdt,
      buyTokenPair: btcDoge,
      buyStablePair: dogeUsdt,
      takerFee,
    });

    if (!result.ok) {
      console.log('「なし」 三角アービトラージ 機会確認', result);
      return { ok: false };
    }

    return { ok: true };
  };

  return { checkBySymbol, checkTriangleArbitrage } as const;
};
