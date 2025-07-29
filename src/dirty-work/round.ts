/**
 * TICK の倍数に切り捨て
 * roundDown(99.9517)  // → 99.951
 */
export const roundDown = (price: number, tick: number) => {
  return Math.floor(price / tick) * tick;
};

/**
 * TICK の倍数に切り上げ
 * roundUp  (99.9517)  // → 99.952
 */
export const roundUp = (price: number, tick: number) => {
  return Math.ceil(price / tick) * tick;
};
