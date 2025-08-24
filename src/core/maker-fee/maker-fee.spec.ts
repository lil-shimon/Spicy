import { describe, it, expect } from 'vitest';
import { getMakerFeeFutures, getMakerFeeSpot } from './maker-fee';
import { EXCHANGES } from '../../constants';

describe('Maker Fee Futures', () => {
  it('should return the correct maker fee for KuCoin futures', () => {
    const fee = getMakerFeeFutures(EXCHANGES.kucoin);
    expect(fee).toBe(0.0002);
  });

  it('should throw an error for undefined exchange', () => {
    expect(() => {
      getMakerFeeFutures(EXCHANGES.BINANCE);
    }).toThrow('Maker fee for futures exchange binance is not defined.');
  });
});

describe('Maker fee spot', () => {
  it('should return the correct maker fee for Kucoin Spot', () => {
    const fee = getMakerFeeSpot(EXCHANGES.kucoin);
    expect(fee).toBe(0.001);
  });

  it('should return an error for undefined exchange', () => {
    expect(() => {
      getMakerFeeSpot(EXCHANGES.BINANCE);
    }).toThrow('Maker fee for spot exchange binance is not defined.');
  });
});
