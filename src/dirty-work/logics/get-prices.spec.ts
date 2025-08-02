import { describe, expect, it } from 'vitest';
import { getPrices } from './get-prices';

describe('getPrices', () => {
  const bestBid = 0.001;
  const bestAsk = 0.002;
  const tickSize = 0.0001;
  const amount = 2000;

  it('should return the correct prices', () => {
    const { buyPrice, sellPrice } = getPrices({
      bestBid,
      bestAsk,
      inventory: 0,
      amount,
      tickSize,
    });

    expect(buyPrice).toEqual(0.0014);
    expect(sellPrice).toEqual(0.0016);
  });

  it('should return the correct prices when inventory is 2000', () => {
    const { buyPrice, sellPrice } = getPrices({
      bestBid,
      bestAsk,
      inventory: 2000,
      amount,
      tickSize,
    });

    expect(buyPrice).toBeCloseTo(0.0014, 4);
    expect(sellPrice).toBeCloseTo(0.0016, 4);
  });

  it('should return the correct prices when inventory is 4000', () => {
    const { buyPrice, sellPrice } = getPrices({
      bestBid,
      bestAsk,
      inventory: 4000,
      amount,
      tickSize,
    });

    expect(buyPrice).toBeCloseTo(0.0012, 4);
    expect(sellPrice).toBeCloseTo(0.0016, 4);
  });

  it('should return the correct prices when inventory is 6000', () => {
    const { buyPrice, sellPrice } = getPrices({
      bestBid,
      bestAsk,
      inventory: 6000,
      amount,
      tickSize,
    });

    expect(buyPrice).toBeCloseTo(0.001, 4);
    expect(sellPrice).toBeCloseTo(0.0016, 4);
  });

  it('should return the correct prices when inventory is -2000', () => {
    const { buyPrice, sellPrice } = getPrices({
      bestBid,
      bestAsk,
      inventory: -2000,
      amount,
      tickSize,
    });

    expect(buyPrice).toBeCloseTo(0.0014, 4);
    expect(sellPrice).toBeCloseTo(0.002, 4);
  });

  it('should return the correct prices when inventory is -4000', () => {
    const { buyPrice, sellPrice } = getPrices({
      bestBid,
      bestAsk,
      inventory: -4000,
      amount,
      tickSize,
    });

    expect(buyPrice).toBeCloseTo(0.0014, 4);
    expect(sellPrice).toBeCloseTo(0.0022, 4);
  });
});
