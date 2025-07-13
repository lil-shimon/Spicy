import { Pair } from "../../constants";
import { bybitClient } from "./bybit-client";

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