import { describe, expect, it } from 'vitest';
import { ExchangeRateRepository } from './exchange-rate.repository';

describe('ExchangeRateRepository', () => {
  const exchangeRateRepository = ExchangeRateRepository();
  it('should return initial exchange rate', () => {
    expect(exchangeRateRepository.getExchangeRate()).toBeNull();
  });

  it('should return updated exchange rate', () => {
    const mockExchangeRate = {
      bid: 1,
      ask: 2,
    };
    exchangeRateRepository.updateExchangeRate(mockExchangeRate);
    expect(exchangeRateRepository.getExchangeRate()).toEqual(mockExchangeRate);
    exchangeRateRepository.updateExchangeRate({ bid: 2.0, ask: 3.0 });
    expect(exchangeRateRepository.getExchangeRate()).toEqual({
      bid: 2.0,
      ask: 3.0,
    });
  });
});
