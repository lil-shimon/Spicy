import { calcTriangleArbitrage } from '../domain/triangle/calc-triangle-arbitrage';
import { PriceRepository } from './../repositories/price.repository';

type ArbitrageServiceParams = {
  priceRepository: ReturnType<typeof PriceRepository>;
};

export const ArbitrageService = (params: ArbitrageServiceParams) => {
  const { priceRepository } = params;

  type Params = {
    pairs: string[];
  };

  type Return = {
    ok: boolean;
    usdtIn?: number;
    usdtOut?: number;
    roi?: number;
    detail?: {
      p1ask: number;
      p2ask: number;
      p3bid: number;
    };
  };

  const checkTriangleArbitrage = (params: Params): Return => {
    const { pairs } = params;

    if (pairs.length !== 3) {
      console.log('設定してる取引ペアの数が3ではありません', pairs);
      return { ok: false };
    }

    const prices = pairs.map((pair) =>
      priceRepository.getPrice(pair, 'kucoin')
    );

    const [p1, p2, p3] = prices;

    if (!p1 || !p2 || !p3) {
      console.log('価格情報が不足しています', {
        p1,
        p2,
        p3,
      });
      return { ok: false };
    }

    // TODO: メソッド化
    const takerFee = 0.001;

    const result = calcTriangleArbitrage({
      buyBtcPair: p1,
      buyTokenPair: p2,
      buyStablePair: p3,
      takerFee,
    });

    if (!result.ok) {
      console.log('「なし」 三角アービトラージ 機会確認', result);
      return { ok: false };
    }

    return result;
  };

  return { checkTriangleArbitrage } as const;
};
