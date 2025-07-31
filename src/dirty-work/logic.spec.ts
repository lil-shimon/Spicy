import { describe, expect, it } from 'vitest';
import { getPrices } from './logic';

describe('getPrices', () => {
  const bestBid = 0.001;
  const bestAsk = 0.002;
  const tickSize = 0.0001;

  it('should return the correct prices', () => {
    const sellCancelCount = 0;
    const buyCancelCount = 0;

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

  it('should return the correct prices when sellCancelCount is 1', () => {
    const sellCancelCount = 1;
    const buyCancelCount = 0;

    const { buyPrice, sellPrice } = getPrices(
      bestBid,
      bestAsk,
      sellCancelCount,
      buyCancelCount,
      tickSize
    );

    expect(buyPrice).toEqual(0.0012);
    expect(sellPrice).toEqual(0.0016);
  });

  it('should return the correct prices when buyCancelCount is 1', () => {
    const sellCancelCount = 0;
    const buyCancelCount = 1;

    const { buyPrice, sellPrice } = getPrices(
      bestBid,
      bestAsk,
      sellCancelCount,
      buyCancelCount,
      tickSize
    );

    expect(buyPrice).toEqual(0.0014);
    expect(sellPrice).toBeCloseTo(0.0018, 4);
  });

  it('should return the correct prices when sellCancelCount is 1 and buyCancelCount is 1', () => {
    const sellCancelCount = 1;
    const buyCancelCount = 1;

    const { buyPrice, sellPrice } = getPrices(
      bestBid,
      bestAsk,
      sellCancelCount,
      buyCancelCount,
      tickSize
    );

    expect(buyPrice).toEqual(0.0012);
    expect(sellPrice).toBeCloseTo(0.0018);
  });
});
