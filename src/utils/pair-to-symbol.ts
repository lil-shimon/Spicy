import { Pair } from "../constants";

export const pairToSymbol = (pair: Pair) => {
  const symbol = pair.replace("/", "");
  return symbol;
};
