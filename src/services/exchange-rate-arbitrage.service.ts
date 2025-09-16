import { PriceRepository } from '../repositories/price.repository';

type ExchangeRateArbitrageServiceParams = {
  priceRepository: ReturnType<typeof PriceRepository>;
};

export const ExchangeRateArbitrageService = (
  params: ExchangeRateArbitrageServiceParams
) => {
  const { priceRepository } = params;

  const checkArbitrage = () => {
    // 1. priceRepositoryから為替レート（USD/JPY）を取得
    const exchangeRate = priceRepository.getPrice('USD_JPY', 'gmo');

    if (!exchangeRate) {
      console.log('USD_JPY為替レートが取得できません');
      return;
    }

    const { bid: usdJpyBid, ask: usdJpyAsk } = exchangeRate;
    console.log(`USD/JPY - Bid: ${usdJpyBid}, Ask: ${usdJpyAsk}`);

    // TODO: 為替アービトラージのチェックロジックを実装
    // 2. 各取引所のUSDT/JPY価格を計算
    // 3. アービトラージ機会があるか判定
    // 4. 利益率の計算
    // 5. Discord通知の送信（機会がある場合）
    console.log('為替アービトラージチェック - 追加実装予定');
  };

  const start = () => {
    // TODO: 為替アービトラージ監視の開始処理を実装
    // 注: 為替レートの更新はexchange-rate.serviceの_updateをcontrollerから呼び出す
    // ここでは監視のセットアップのみ行う
    console.log('為替アービトラージ監視開始 - 未実装');
  };

  return {
    start,
    checkArbitrage,
  } as const;
};
