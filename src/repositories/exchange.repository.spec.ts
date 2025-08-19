import { describe, expect, it } from 'vitest';
import { ExchangeRepository } from './exchange.repository';

describe('ExchangeRepository', () => {
  it('should return initial exchange rate', () => {
    const exchangeRepository = ExchangeRepository();
    expect(exchangeRepository.getExchangeRate()).toBe(0);
  });

  it('should return updated exchange rate', () => {
    const exchangeRepository = ExchangeRepository();
    exchangeRepository.updateExchangeRate(1.5);
    expect(exchangeRepository.getExchangeRate()).toBe(1.5);
    exchangeRepository.updateExchangeRate(2.0);
    expect(exchangeRepository.getExchangeRate()).toBe(2.0);
  });
});
