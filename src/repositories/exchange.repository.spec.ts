import { describe, expect, it } from 'vitest';
import { ExchangeRepository } from './exchange.repository';

describe('ExchangeRepository', () => {
  const exchangeRepository = ExchangeRepository();
  it('should return initial exchange rate', () => {
    expect(exchangeRepository.getExchangeRate()).toBeNull();
  });

  it('should return updated exchange rate', () => {
    const mockExchangeRate = {
      bid: 1,
      ask: 2,
    };
    exchangeRepository.updateExchangeRate(mockExchangeRate);
    expect(exchangeRepository.getExchangeRate()).toEqual(mockExchangeRate);
    exchangeRepository.updateExchangeRate({ bid: 2.0, ask: 3.0 });
    expect(exchangeRepository.getExchangeRate()).toEqual({
      bid: 2.0,
      ask: 3.0,
    });
  });
});
