/**
 * 板のエントリを表す型
 * @typedef {Array<string, number>} OrderBookEntry
 * @property {number} 0 - 価格
 * @property {number} 1 - 数量
 */
export type OrderBookEntry = [number, number];
