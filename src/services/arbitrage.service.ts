import { EXCHANGES } from '../constants';
import { getMakerFeeSpot } from '../core/maker-fee/maker-fee';
import { PriceRepository } from './../repositories/price.repository';
import { ExchangeRateService } from './exchange-rate.service';

type ArbitrageServiceParams = {
  exchangeRateService: ReturnType<typeof ExchangeRateService>;
  priceRepository: ReturnType<typeof PriceRepository>;
};

type PriceInfo = {
  ask: number;
  bid: number;
  makerFee: number;
  /**
   * 為替レートでの変換が必要かどうか
   */
  needsConversion?: boolean;
};

type CheckParams = {
  exchangeA: PriceInfo;
  exchangeB: PriceInfo;
};

export const ArbitrageService = (params: ArbitrageServiceParams) => {
  const { exchangeRateService, priceRepository } = params;

  const checkBySymbol = (symbol: string) => {
    const gmoPrice = priceRepository.getPrice(symbol, 'gmo');
    const kucoinPrice = priceRepository.getPrice(symbol, 'kucoin');

    if (!gmoPrice || !kucoinPrice) {
      return;
    }

    const gmoMakerFee = getMakerFeeSpot(EXCHANGES.GMO);
    const gmo = {
      ask: gmoPrice.ask,
      bid: gmoPrice.bid,
      makerFee: gmoMakerFee,
      needsConversion: false,
    };

    const kucoinMakerFee = getMakerFeeSpot(EXCHANGES.kucoin);
    const kucoin = {
      ask: kucoinPrice.ask,
      bid: kucoinPrice.bid,
      makerFee: kucoinMakerFee,
      needsConversion: true,
    };

    return check({ exchangeA: gmo, exchangeB: kucoin });
  };

  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;

    const a = exchangeA.needsConversion
      ? exchangeRateService.toJpy(exchangeA)
      : exchangeA;
    const b = exchangeB.needsConversion
      ? exchangeRateService.toJpy(exchangeB)
      : exchangeB;

    if (!a || !b) {
      return;
    }

    const aWithFee = {
      bid: a.bid * (1 + exchangeA.makerFee),
      ask: a.ask * (1 - exchangeA.makerFee),
    };

    const bWithFee = {
      bid: b.bid * (1 + exchangeB.makerFee),
      ask: b.ask * (1 - exchangeB.makerFee),
    };

    // 指値でMMっぽくする時の比較
    const aToB = compare({ buyPrice: aWithFee.bid, sellPrice: bWithFee.ask });
    const bToA = compare({ buyPrice: bWithFee.bid, sellPrice: aWithFee.ask });

    console.log('aToB', aToB, 'bToA', bToA);

    return {
      aToB,
      bToA,
    };
  };

  const compare = ({
    buyPrice,
    sellPrice,
  }: {
    buyPrice: number;
    sellPrice: number;
  }) => {
    return sellPrice - buyPrice;
  };

  return { checkBySymbol } as const;
};
