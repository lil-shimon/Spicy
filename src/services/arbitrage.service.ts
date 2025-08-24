import { postMessage } from '../clients';
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
  exchangeName: string;
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
      exchangeName: EXCHANGES.GMO,
    };

    const kucoinMakerFee = getMakerFeeSpot(EXCHANGES.kucoin);
    const kucoin = {
      ask: kucoinPrice.ask,
      bid: kucoinPrice.bid,
      makerFee: kucoinMakerFee,
      needsConversion: true,
      exchangeName: EXCHANGES.kucoin,
    };

    const spread = calculateSpread({ exchangeA: gmo, exchangeB: kucoin });
    if (!spread) {
      return;
    }

    if (spread.exchangeAResponse.profit || spread.exchangeBResponse.profit) {
      const hasProfit = [
        spread.exchangeAResponse,
        spread.exchangeBResponse,
      ].filter((s) => s.profit);
      console.log('spreads', hasProfit);

      const messages = hasProfit.map(
        (p) =>
          `アビトラの機会を発見しました!\n買い：${p.buy}\n売り：${p.sell}\nスプレッド：${p.spread}`
      );

      Promise.all(messages.map((m) => postMessage(m)));
    }
  };

  const calculateSpread = (params: CheckParams) => {
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

    const aWithFee = applyFee({
      bid: a.bid,
      ask: a.ask,
      fee: exchangeA.makerFee,
    });

    const bWithFee = applyFee({
      bid: b.bid,
      ask: b.ask,
      fee: exchangeB.makerFee,
    });

    // 指値でMMっぽくする時の比較
    const aToB = compare({ buyPrice: aWithFee.bid, sellPrice: bWithFee.ask });
    const bToA = compare({ buyPrice: bWithFee.bid, sellPrice: aWithFee.ask });

    const exchangeAResponse = {
      spread: aToB,
      profit: aToB > 0,
      buy: exchangeA.exchangeName,
      buyPrice: aWithFee.bid,
      sell: exchangeB.exchangeName,
      sellPrice: bWithFee.ask,
    };

    const exchangeBResponse = {
      spread: bToA,
      profit: bToA > 0,
      buy: exchangeB.exchangeName,
      buyPrice: bWithFee.bid,
      sell: exchangeA.exchangeName,
      sellPrice: aWithFee.ask,
    };

    console.table([exchangeAResponse, exchangeBResponse]);

    return {
      exchangeAResponse,
      exchangeBResponse,
    };
  };

  // TODO: プロジェクト内に同じような関数がありそう
  // params本当にこれが良いのか？
  const applyFee = (price: { bid: number; ask: number; fee: number }) => {
    return {
      bid: price.bid * (1 + price.fee),
      ask: price.ask * (1 - price.fee),
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
