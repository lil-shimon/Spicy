export const createL2Topic = (pair: string): string => {
  return `/market/level2:${pair}`;
};
