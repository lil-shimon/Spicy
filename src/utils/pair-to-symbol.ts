import { Pair } from '../constants';

// 使ってないから不要そうだったら削除
export const pairToSymbol = (pair: Pair) => {
  const symbol = pair.replace('/', '');
  return symbol;
};
