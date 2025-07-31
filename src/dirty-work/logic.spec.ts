import { describe, expect, it } from 'vitest';
import { getPrices } from './logic';

describe('getPrices', () => {
  it('should return the correct prices', () => {
    const bestBid = 0.001;
    const bestAsk = 0.002;
    const sellCancelCount = 0;
    const buyCancelCount = 0;
    const tickSize = 0.0001;

    const { buyPrice, sellPrice } = getPrices(
      bestBid,
      bestAsk,
      sellCancelCount,
      buyCancelCount,
      tickSize
    );

    expect(buyPrice).toEqual(0.0014);
    expect(sellPrice).toEqual(0.0016);
  });
});
