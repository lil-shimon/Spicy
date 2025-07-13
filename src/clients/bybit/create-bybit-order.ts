import { bybit } from "ccxt";
import { Pair } from "../../constants";

// Bybitクライアントのインスタンスを作成
const bybitClient = new bybit();

export const createBybitOrder = async (
  pair: Pair,
  side: "buy" | "sell",
  amount: number
) => {
  try {
    const order = await bybitClient.createOrder(pair, "market", side, amount);
    console.log("Bybitでの注文が成功しました:", order);
    return order;
  } catch (error) {
    console.error("Bybitでの注文作成中にエラーが発生しました:", error);
    throw error;
  }
};