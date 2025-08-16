import { describe, it, expect } from 'vitest';
import { getMakerFeeFutures } from './maker-fee';
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
