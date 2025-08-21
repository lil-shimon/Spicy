import { gmoWebSocketClient } from '../clients/gmo/gmo-ws';
import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { PriceRepository } from '../repositories/price.repository';
import { ArbitrageService } from './arbitrage.service';

// TODO: ArbitrageServiceを依存性として受け取る
// - ファクトリーのパラメータに追加
type PriceServiceParams = {
  symbol: string;
};

const priceRepository = PriceRepository();
const arbitrageService = ArbitrageService();

export const PriceService = () => {
  const start = async (params: PriceServiceParams) => {
    const { symbol } = params;
    await Promise.all([
      gmoWebSocketClient({
        symbol,
        onUpdate: (bid, ask) => {
          // TODO: GMO WebSocketのonUpdateコールバック内
          // - updatePriceの戻り値をhasChangedに格納
          // - if (hasChanged) でcheckBySymbol(symbol)を呼び出し
          const hasChanged = priceRepository.updatePrice(
            symbol,
            'gmo',
            bid,
            ask
          );
        },
      }),
      connectKucoin({
        pair: `${symbol}-USDT`,
        onUpdate: (bid, ask) => {
          // TODO: KuCoin WebSocketのonUpdateコールバック内
          // - 同様にupdatePriceの戻り値をチェック
          // - 価格変更時のみcheckBySymbol(symbol)を呼び出し
          const hasChanged = priceRepository.updatePrice(
            symbol,
            'kucoin',
            bid,
            ask
          );
        },
        onError: (error) => {
          console.error('Kucoin error', error);
        },
        onClose: () => {
          console.log('Kucoin close');
        },
      }),
    ]);
  };

  return { start } as const;
};
