import { calcTriangleArbitrage } from '../domain/triangle';
import { PriceRepository } from './../repositories/price.repository';

type ArbitrageServiceParams = {
  priceRepository: ReturnType<typeof PriceRepository>;
};

export const ArbitrageService = (params: ArbitrageServiceParams) => {
  const { priceRepository } = params;

  type Params = {
    symbols: string[];
  };

  type Return = {
    ok: boolean;
  };

  const checkTriangleArbitrage = (params: Params): Return => {
    const { symbols } = params;

    if (symbols.length !== 3) {
      console.log('symbolsの数が3ではありません', symbols);
      return { ok: false };
    }

    const prices = symbols.map((symbol) =>
      priceRepository.getPrice(symbol, 'kucoin')
    );

    const [btcUsdt, btcDoge, dogeUsdt] = prices;

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

  return { checkTriangleArbitrage } as const;
};
