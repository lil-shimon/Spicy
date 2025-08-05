import { describe, it, expect } from 'vitest';
import { convertToFuturesSymbol } from './symbol-converter';

describe('convertToFuturesSymbol', () => {
  it('should convert BTC/USDT to XBTUSDTM', () => {
    expect(convertToFuturesSymbol('BTC/USDT')).toBe('XBTUSDTM');
  });

  it('should throw error for non-USDT pairs', () => {
    expect(() => convertToFuturesSymbol('BTC/USDC')).toThrow(
      'Unsupported spot symbol format: BTC/USDC'
    );
  });

  it('should throw error for symbols without slash', () => {
    expect(() => convertToFuturesSymbol('BTCUSDT')).toThrow(
      'Unsupported spot symbol format: BTCUSDT. Expected format like \'BTC/USDT\'.'
    );
  });

  it('should throw error for empty string', () => {
    expect(() => convertToFuturesSymbol('')).toThrow(
      'Unsupported spot symbol format: . Expected format like \'BTC/USDT\'.'
    );
  });

  it('should throw error for symbols with multiple slashes', () => {
    expect(() => convertToFuturesSymbol('BTC/USDT/EXTRA')).toThrow(
      'Unsupported spot symbol format: BTC/USDT/EXTRA. Expected format like \'BTC/USDT\'.'
    );
  });
});
