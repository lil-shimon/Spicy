import { ARBITRAGE_PROFIT_THRESHOLD } from "../../constants";
import { FetchPriceResult } from "../fetch-price/fetch-price";

/**
 * アービトラージの機会をチェックします。
 * @param profit - 利益率の配列
 * @returns {boolean} - アービトラージの機会がある場合はtrue、ない場合はfalse
 */
export const checkArbitrageOpportunities = (profit: FetchPriceResult[]) => {
  const hasProfit = profit.some((p) => p.profit > 0);

  if (!hasProfit) {
    console.log("利益がないため、メッセージを送信しません。");
    return false;
  }

  const arbitrageOpportunities = profit.filter(
    (p) => p.profit > ARBITRAGE_PROFIT_THRESHOLD * 100
  );

  if (arbitrageOpportunities.length === 0) {
    console.log("利益率が0.5%を超えるアービトラージの機会はありません。");
    return false;
  }

  return true;
};
