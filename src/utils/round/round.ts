/**
 * tickSizeの倍数に切り捨て
 * @param price 価格
 * @param tick tickSize（最小価格単位）
 * @returns 切り捨てた価格
 * @example
 * roundDown(99.9517, 0.001)  // → 99.951
 */
export const roundDown = (price: number, tick: number): number => {
  return Math.floor(price / tick) * tick;
};

/**
 * tickSizeの倍数に切り上げ
 * @param price 価格
 * @param tick tickSize（最小価格単位）
 * @returns 切り上げた価格
 * @example
 * roundUp(99.9517, 0.001)  // → 99.952
 */
export const roundUp = (price: number, tick: number): number => {
  return Math.ceil(price / tick) * tick;
};
