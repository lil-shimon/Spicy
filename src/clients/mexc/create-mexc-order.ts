import { mexc } from "ccxt";
import { Pair } from "../../constants";

export const createMexcOrder = async (
  pair: Pair,
  side: "buy" | "sell",
  amount: number,
  client: mexc
) => {
  try {
    const order = await client.createOrder(pair, "market", side, amount);
    console.log("MEXCでの注文が成功しました:", order);
    return order;
  } catch (error) {
    console.error("MEXCでの注文作成中にエラーが発生しました:", error);
    throw error;
  }
};
