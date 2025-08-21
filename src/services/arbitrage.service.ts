import { PriceRepository } from './../repositories/price.repository';
import { ExchangeRateService } from './exchange-rate.service';

// TODO: PriceRepositoryを依存性注入で受け取る
// - コンストラクタまたはファクトリーのパラメータとして追加

type Exchange = {
  ask: number;
  bid: number;
  /**
   * 為替レートでの変換が必要かどうか
   */
  needsConversion?: boolean;
};

type CheckParams = {
  exchangeA: Exchange;
  exchangeB: Exchange;
};

const exchangeRateService = ExchangeRateService();
const priceRepository = PriceRepository();

export const ArbitrageService = () => {
  // TODO: checkBySymbolメソッドを新規追加
  // - 引数: symbol (string)
  // - priceRepository.getPrice(symbol, 'gmo')で価格取得
  // - priceRepository.getPrice(symbol, 'kucoin')で価格取得
  // - 両方の価格が存在する場合のみcheck()を呼び出し
  // - GMOはneedsConversion: true、KuCoinはfalse

  const checkBySymbol = (symbol: string) => {
    const gmoPrice = priceRepository.getPrice(symbol, 'gmo');
    const kucoinPrice = priceRepository.getPrice(symbol, 'kucoin');

    if (!gmoPrice || !kucoinPrice) {
      console.log('価格情報がないのでチェックをスキップします');
      return;
    }

    const gmo = {
      ask: gmoPrice.ask,
      bid: gmoPrice.bid,
      needsConversion: false,
    };

    const kucoin = {
      ask: kucoinPrice.ask,
      bid: kucoinPrice.bid,
      needsConversion: true,
    };

    return check({ exchangeA: gmo, exchangeB: kucoin });
  };

  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;

    // TODO: 手数料計算
    const a = exchangeA.needsConversion
      ? exchangeRateService.toJpy(exchangeA)
      : exchangeA;
    const b = exchangeB.needsConversion
      ? exchangeRateService.toJpy(exchangeB)
      : exchangeB;

    if (!a || !b) {
      return;
    }

    // 指値でMMっぽくする時の比較
    const aToB = compare({ buyPrice: a.bid, sellPrice: b.ask });
    const bToA = compare({ buyPrice: b.bid, sellPrice: a.ask });

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

  return { check, checkBySymbol } as const;
};
