import { bybit } from "ccxt";
import "dotenv/config";

const apiKey = process.env.BYBIT_API_KEY;
const secret = process.env.BYBIT_SECRET;

export const fetchBybitBalance = async () => {
  if (!apiKey || !secret) {
    console.log("api key:", apiKey);
    console.log("secret:", secret);
    console.error("Bybit APIキーまたはシークレットが設定されていません。");
    return;
  }
  const client = new bybit({
    apiKey: apiKey || "",
    secret: secret || "",
  });

  const balance = await client.fetchBalance();
  console.log("bybit Balance:", balance);
};
