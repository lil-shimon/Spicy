import { describe, it, expect } from 'vitest';
import { convertToFuturesSymbol } from './symbol-converter';

describe('convertToFuturesSymbol', () => {
  it('should convert BTC/USDT to XBTUSDTM', () => {
    expect(convertToFuturesSymbol('BTC/USDT')).toBe('XBTUSDTM');
  });

  it('should throw error for invalid format', () => {
    expect(() => convertToFuturesSymbol('BTC/USDC')).toThrow(
      'Unsupported spot symbol format: BTC/USDC'
    );
  });
});
