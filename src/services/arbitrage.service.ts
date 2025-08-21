import { ExchangeService } from './exchange.service';

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

const exchangeService = ExchangeService();

export const ArbitrageService = () => {
  // TODO: checkBySymbolメソッドを新規追加
  // - 引数: symbol (string)
  // - priceRepository.getPrice(symbol, 'gmo')で価格取得
  // - priceRepository.getPrice(symbol, 'kucoin')で価格取得
  // - 両方の価格が存在する場合のみcheck()を呼び出し
  // - GMOはneedsConversion: true、KuCoinはfalse

  const check = (params: CheckParams) => {
    const { exchangeA, exchangeB } = params;

    // TODO: 手数料計算
    const a = exchangeA.needsConversion
      ? exchangeService.toJpy(exchangeA)
      : exchangeA;
    const b = exchangeB.needsConversion
      ? exchangeService.toJpy(exchangeB)
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

  return { check } as const;
};
