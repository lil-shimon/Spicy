import { calcTriangleArbitrage } from '../domain/triangle/calc-triangle-arbitrage';
import { PriceRepository } from './../repositories/price.repository';

type ArbitrageServiceParams = {
  priceRepository: ReturnType<typeof PriceRepository>;
};

export const ArbitrageService = (params: ArbitrageServiceParams) => {
  const { priceRepository } = params;

  type Params = {
    triangle: string[];
  };

  type Return = {
    ok: boolean;
    usdtIn?: number;
    usdtOut?: number;
    roi?: number;
    detail?: {
      baseAsk: number;
      midAsk: number;
      outBid: number;
    };
  };

  const checkTriangleArbitrage = (params: Params): Return => {
    const { triangle } = params;

    if (triangle.length !== 3) {
      console.log('設定してる取引ペアの数が3ではありません', triangle);
      return { ok: false };
    }

    const prices = triangle.map((pair) =>
      priceRepository.getPrice(pair, 'kucoin')
    );

    const [base, mid, out] = prices;

    if (!base || !mid || !out) {
      console.log('価格情報が不足しています', {
        p1: base,
        p2: mid,
        p3: out,
      });
      return { ok: false };
    }

    // TODO: メソッド化
    const takerFee = 0.001;

    const result = calcTriangleArbitrage({
      buyBtcPair: base,
      buyTokenPair: mid,
      buyStablePair: out,
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
