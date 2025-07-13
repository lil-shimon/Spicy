import { Pair } from "../../constants";
import { mexcClient } from "./mexc-client";

export const createMexcOrder = async (
  pair: Pair,
  side: "buy" | "sell",
  amount: number
) => {
  try {
    const order = await mexcClient.createOrder(pair, "market", side, amount);
    console.log("MEXCでの注文が成功しました:", order);
    return order;
  } catch (error) {
    console.error("MEXCでの注文作成中にエラーが発生しました:", error);
    throw error;
  }
};
