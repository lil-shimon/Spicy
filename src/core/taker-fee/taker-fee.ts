import { Exchange, TAKER_FEES } from "../../constants";

export const getTakerFee = (exchange: Exchange) => {
  const takerFee = TAKER_FEES[exchange];
  if (!takerFee) {
    throw new Error(`Taker fee for exchange ${exchange} is not defined.`);
  }

  return takerFee;
};
