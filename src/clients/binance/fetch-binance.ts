import { Pair, PAIRS } from '../../constants';
import { binanceClient } from './binance-client';

export const fetchBinance = async (pair: Pair) => {
  // XO_USDTはBinanceでは取扱いがないため、0を返す
  // 本当はこの処理は他の箇所で行いたい
  // TODO: refactorして、XO_USDTの処理を他の箇所に移動する
  if (pair === PAIRS.XO_USDT) {
    return {
      bid: 0,
      ask: 0,
    };
  }

  try {
    const ticker = await binanceClient.fetchTicker(pair);
    return {
      // NOTE: レスポンスがNum形になっているので、nullチェックを行う
      // もしnullの場合は0を返す
      bid: ticker.bid ?? 0,
      ask: ticker.ask ?? 0,
    };
  } catch (error) {
    console.error(`binance: 価格取得に失敗しました: ${pair}`, error);
    return {
      bid: 0,
      ask: 0,
    };
  }
};
