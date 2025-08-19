import { describe, expect, it } from 'vitest';
import { ExchangeRepository } from './exchange.repository';

describe('ExchangeRepository', () => {
  const exchangeRepository = ExchangeRepository();
  it('should return initial exchange rate', () => {
    expect(exchangeRepository.getExchangeRate()).toBeNull;
  });

  it('should return updated exchange rate', () => {
    exchangeRepository.updateExchangeRate(1.5);
    expect(exchangeRepository.getExchangeRate()).toBe(1.5);
    exchangeRepository.updateExchangeRate(2.0);
    expect(exchangeRepository.getExchangeRate()).toBe(2.0);
  });
});
